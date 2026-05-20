BACKEND_DIR  = user-account
FRONTEND_DIR = templater
K8S_OVERLAY  = infra/k8s/overlays/minikube
K8S_MIGRATE  = infra/k8s/base/migration-job.yaml
CONFIG_FILE  = .env.local
IMAGE_TAG    = v1.0.2
REGISTRY_NAMESPACE ?= tsermakov

K8S_BACKEND_NS    = actium-backend
K8S_FRONTEND_NS   = actium-frontend
K8S_MONITORING_NS = actium-monitoring

BACKEND_IMG  = $(REGISTRY_NAMESPACE)/actium-user-account-backend:$(IMAGE_TAG)
AI_IMG       = $(REGISTRY_NAMESPACE)/actium-ai-backend:$(IMAGE_TAG)
FRONTEND_IMG = $(REGISTRY_NAMESPACE)/actium-templater-frontend:$(IMAGE_TAG)

YELLOW = \033[0;33m
NC     = \033[0m

.PHONY: run stop clean build-all push-cloud push-local start-cluster db-host-up deploy deploy-local migrate status restart logs-back reset-db

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
	@if [ ! -f infra/database/.env.db ]; then cp infra/database/.env.db.example infra/database/.env.db; fi
	cd infra/database && docker compose --env-file .env.db up -d

deploy: db-host-up
	@echo "$(YELLOW)--- Deploying to K8s (kustomize) ---$(NC)"
	kubectl apply -k $(K8S_OVERLAY)
	kubectl create configmap backend-config -n $(K8S_BACKEND_NS) --from-env-file=$(CONFIG_FILE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl create secret generic backend-secrets -n $(K8S_BACKEND_NS) --from-env-file=$(CONFIG_FILE) --dry-run=client -o yaml | kubectl apply -f -
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
