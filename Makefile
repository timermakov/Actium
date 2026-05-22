BACKEND_DIR  = user-account
FRONTEND_DIR = templater
K8S_OVERLAY  = infra/k8s/overlays/minikube
K8S_MIGRATE  = infra/k8s/base/migration-job.yaml
CONFIG_FILE  = .env.local
VERSIONS_FILE = versions.yaml
REGISTRY_NAMESPACE ?= tsermakov

BACKEND_TAG  := $(shell bash scripts/version.sh image-tag user-account-srv 2>/dev/null || echo v1.1.0)
FRONTEND_TAG := $(shell bash scripts/version.sh image-tag frontend 2>/dev/null || echo v1.2.0)
AI_TAG       := $(shell bash scripts/version.sh image-tag ai-srv 2>/dev/null || echo v1.0.0)

K8S_BACKEND_NS    = actium-backend
K8S_FRONTEND_NS   = actium-frontend
K8S_MONITORING_NS = actium-monitoring

BACKEND_IMG  = $(REGISTRY_NAMESPACE)/actium-user-account-srv:$(BACKEND_TAG)
AI_IMG       = $(REGISTRY_NAMESPACE)/actium-ai-srv:$(AI_TAG)
FRONTEND_IMG = $(REGISTRY_NAMESPACE)/actium-templater-frontend:$(FRONTEND_TAG)

YELLOW = \033[0;33m
NC     = \033[0m

.PHONY: run stop clean build-all push-cloud push-local start-cluster db-host-up deploy deploy-local migrate status restart logs-back reset-db reset-k8s-workloads reset-k8s-postgres reset-k8s-postgres-data version sync-image-tags
.PHONY: bump-patch-backend bump-minor-backend bump-major-backend bump-patch-frontend bump-minor-frontend bump-patch-ai bump-minor-ai

version:
	@bash scripts/version.sh show

sync-image-tags:
	@bash scripts/kustomize-set-image-tags.sh minikube $(REGISTRY_NAMESPACE)

bump-patch-backend:
	@bash scripts/version.sh bump patch user-account-srv
bump-minor-backend:
	@bash scripts/version.sh bump minor user-account-srv
bump-major-backend:
	@bash scripts/version.sh bump major user-account-srv
bump-patch-frontend:
	@bash scripts/version.sh bump patch frontend
bump-minor-frontend:
	@bash scripts/version.sh bump minor frontend
bump-patch-ai:
	@bash scripts/version.sh bump patch ai-srv
bump-minor-ai:
	@bash scripts/version.sh bump minor ai-srv

run:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local up -d --build --renew-anon-volumes

stop:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local down
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local down

reset-db:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local down -v
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build

# --- BUILD LOGIC (DRY - Don't Repeat Yourself) ---

build-all: build-frontend build-backend build-ai

build-frontend:
	@echo "$(YELLOW)--- Building Frontend ---$(NC)"
	docker build --no-cache --build-arg VITE_API_BASE_URL=/api/user -t $(FRONTEND_IMG) ./$(FRONTEND_DIR)/apps/web

build-backend:
	@echo "$(YELLOW)--- Building Backend ---$(NC)"
	docker build -t $(BACKEND_IMG) ./$(BACKEND_DIR)

build-ai:
	@echo "$(YELLOW)--- Building AI Service ---$(NC)"
	docker build -t $(AI_IMG) ./$(FRONTEND_DIR)/apps/api

# --- PUBLISHING ---

push-local: build-all
	@echo "$(YELLOW)--- Loading images into Minikube ---$(NC)"
	minikube image load $(BACKEND_IMG) --overwrite
	minikube image load $(AI_IMG) --overwrite
	minikube image load $(FRONTEND_IMG) --overwrite

push-cloud: build-all
	@echo "$(YELLOW)--- Pushing images to Docker Hub ---$(NC)"
	docker push $(BACKEND_IMG)
	docker push $(AI_IMG)
	docker push $(FRONTEND_IMG)

# --- KUBERNETES ---
start-cluster:
	minikube start --driver=docker --wait=all
	minikube addons enable metrics-server
	minikube addons enable ingress

db-host-up:
	@echo "$(YELLOW)--- Starting host PostgreSQL ---$(NC)"
ifdef OS
	@if not exist infra\database\.env.db copy /Y infra\database\.env.db.example infra\database\.env.db
else
	@test -f infra/database/.env.db || cp infra/database/.env.db.example infra/database/.env.db
endif
	cd infra/database && docker compose --env-file .env.db up -d

reset-k8s-workloads:
	@echo "$(YELLOW)--- Deleting workloads (immutable selector recovery) ---$(NC)"
	-kubectl -n $(K8S_BACKEND_NS) delete deployment user-account-backend ai-backend --ignore-not-found
	-kubectl -n $(K8S_FRONTEND_NS) delete deployment frontend --ignore-not-found
	-kubectl -n $(K8S_MONITORING_NS) delete deployment prometheus grafana kube-state-metrics --ignore-not-found
	-kubectl -n $(K8S_MONITORING_NS) delete daemonset node-exporter --ignore-not-found

deploy: sync-image-tags
	@echo "$(YELLOW)--- Deploying to K8s (kustomize) backend=$(BACKEND_TAG) frontend=$(FRONTEND_TAG) ai=$(AI_TAG) ---$(NC)"
	kubectl apply -k $(K8S_OVERLAY)
	kubectl create configmap backend-config -n $(K8S_BACKEND_NS) --from-env-file=$(CONFIG_FILE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl create secret generic backend-secrets -n $(K8S_BACKEND_NS) --from-env-file=$(CONFIG_FILE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl create secret generic postgres-credentials -n actium-database --from-env-file=$(CONFIG_FILE) --dry-run=client -o yaml | kubectl apply -f -
	@echo "$(YELLOW)--- Waiting for PostgreSQL ---$(NC)"
	kubectl -n actium-database rollout status statefulset/postgres --timeout=180s
	kubectl -n $(K8S_BACKEND_NS) set image deployment/user-account-backend backend=$(BACKEND_IMG) db-migrate=$(BACKEND_IMG)
	kubectl -n $(K8S_BACKEND_NS) set image deployment/ai-backend ai-api=$(AI_IMG)
	kubectl -n $(K8S_FRONTEND_NS) set image deployment/frontend web=$(FRONTEND_IMG)
	$(MAKE) migrate
	kubectl -n $(K8S_BACKEND_NS) rollout status deployment/user-account-backend --timeout=180s
	kubectl -n $(K8S_BACKEND_NS) rollout status deployment/ai-backend --timeout=180s
	kubectl -n $(K8S_FRONTEND_NS) rollout status deployment/frontend --timeout=180s
	kubectl -n $(K8S_MONITORING_NS) rollout status deployment/prometheus --timeout=180s
	kubectl -n $(K8S_MONITORING_NS) rollout status deployment/grafana --timeout=180s

deploy-local: push-local deploy

migrate:
	@echo "$(YELLOW)--- Running DB Migrations ---$(NC)"
	-kubectl -n $(K8S_BACKEND_NS) delete job user-account-db-migrate --ignore-not-found
	kubectl apply -f $(K8S_MIGRATE)
	kubectl -n $(K8S_BACKEND_NS) wait --for=condition=complete --timeout=180s job/user-account-db-migrate
	kubectl -n $(K8S_BACKEND_NS) logs -l job-name=user-account-db-migrate

status:
	kubectl get pods,svc,ingress,hpa -A

restart:
	kubectl -n $(K8S_BACKEND_NS) rollout restart deployment user-account-backend
	kubectl -n $(K8S_BACKEND_NS) rollout restart deployment ai-backend
	kubectl -n $(K8S_FRONTEND_NS) rollout restart deployment frontend

logs-back:
	kubectl -n $(K8S_BACKEND_NS) logs -l app=user-account-backend -f

clean:
	-kubectl delete -k $(K8S_OVERLAY) --ignore-not-found
	-kubectl -n $(K8S_BACKEND_NS) delete configmap backend-config --ignore-not-found
	-kubectl -n $(K8S_BACKEND_NS) delete secret backend-secrets --ignore-not-found
	-kubectl -n actium-database delete secret postgres-credentials --ignore-not-found

reset-k8s-postgres:
	@echo "$(YELLOW)--- Deleting Postgres StatefulSet (PVCs kept) ---$(NC)"
	-kubectl -n actium-database delete statefulset postgres --ignore-not-found
	-kubectl -n actium-database delete svc postgres --ignore-not-found

reset-k8s-postgres-data: reset-k8s-postgres
	@echo "$(YELLOW)--- Deleting Postgres PVCs (data loss) ---$(NC)"
	-kubectl -n actium-database delete pvc -l app=postgres --ignore-not-found
