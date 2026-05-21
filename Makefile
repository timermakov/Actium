BACKEND_DIR  = user-account
FRONTEND_DIR = templater
K8S_DIR      = k8s
CONFIG_FILE  = .env.local
IMAGE_TAG    = v1.0.2
REGISTRY_NAMESPACE ?= tsermakov

K8S_BACKEND_NS    = actium-backend
K8S_FRONTEND_NS   = actium-frontend
K8S_MONITORING_NS = actium-monitoring
K8S_DATABASE_NS   = actium-database

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

# Для Minikube (локально)
push-local: build-all
	@echo "$(YELLOW)--- Loading images into Minikube ---$(NC)"
	minikube image load $(BACKEND_IMG) --overwrite
	minikube image load $(AI_IMG) --overwrite
	minikube image load $(FRONTEND_IMG) --overwrite

# Для Docker Hub (облако)
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
	@echo "$(YELLOW)--- Deploying to K8s ---$(NC)"
	kubectl apply -f $(K8S_DIR)/namespaces.yaml
	kubectl create configmap backend-config -n $(K8S_BACKEND_NS) --from-env-file=$(CONFIG_FILE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply -f $(K8S_DIR)/user-backend.yaml
	kubectl apply -f $(K8S_DIR)/ai-backend.yaml
	kubectl apply -f $(K8S_DIR)/frontend.yaml
	kubectl apply -f $(K8S_DIR)/prometheus.yaml
	kubectl apply -f $(K8S_DIR)/node-exporter.yaml
	kubectl apply -f $(K8S_DIR)/kube-state-metrics.yaml
	kubectl apply -f $(K8S_DIR)/grafana-provisioning.yaml
	kubectl apply -f $(K8S_DIR)/grafana-dashboard-user-backend.yaml
	kubectl apply -f $(K8S_DIR)/grafana-dashboard-frontend.yaml
	kubectl apply -f $(K8S_DIR)/grafana-dashboard-k8s-pods.yaml
	kubectl apply -f $(K8S_DIR)/grafana-dashboard-api-overview.yaml
	kubectl apply -f $(K8S_DIR)/grafana.yaml
	kubectl apply -f $(K8S_DIR)/ingress-backend.yaml
	kubectl apply -f $(K8S_DIR)/ingress-grafana.yaml
	kubectl apply -f $(K8S_DIR)/ingress-frontend.yaml
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
	kubectl apply -f $(K8S_DIR)/migration-job.yaml
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
	-kubectl delete -f $(K8S_DIR)/ingress-frontend.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/ingress-grafana.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/ingress-backend.yaml --ignore-not-found
	-kubectl -n $(K8S_FRONTEND_NS) delete ingress actium-ingress --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/grafana.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/grafana-dashboard-k8s-pods.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/grafana-dashboard-api-overview.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/grafana-dashboard-frontend.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/grafana-dashboard-user-backend.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/grafana-provisioning.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/kube-state-metrics.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/node-exporter.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/prometheus.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/frontend.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/ai-backend.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/user-backend.yaml --ignore-not-found
	-kubectl delete -f $(K8S_DIR)/migration-job.yaml --ignore-not-found
	-kubectl -n $(K8S_BACKEND_NS) delete configmap backend-config --ignore-not-found