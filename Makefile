BACKEND_DIR  = user-account
FRONTEND_DIR = templater
K8S_DIR      = k8s
CONFIG_FILE  = .env.local
IMAGE_TAG    = v1.0.2

BACKEND_IMG  = mgfallen/actium-user-account-backend:$(IMAGE_TAG)
AI_IMG       = mgfallen/actium-ai-backend:$(IMAGE_TAG)
FRONTEND_IMG = mgfallen/actium-templater-frontend:$(IMAGE_TAG)

YELLOW = \033[0;33m
NC     = \033[0m

.PHONY: run stop clean build-all push-cloud push-local deploy migrate status restart logs-back reset-db

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
	docker build --no-cache \
       --build-arg VITE_API_BASE_URL=/api/user \
       -t $(FRONTEND_IMG) ./$(FRONTEND_DIR)/apps/web

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

deploy:
	@echo "$(YELLOW)--- Deploying to K8s ---$(NC)"
	-kubectl delete configmap backend-config --ignore-not-found
	kubectl create configmap backend-config --from-env-file=$(CONFIG_FILE)

	kubectl apply -f $(K8S_DIR)/

	kubectl set image deployment/user-account-backend backend=$(BACKEND_IMG)
	kubectl set image deployment/ai-backend ai-api=$(AI_IMG)
	kubectl set image deployment/frontend web=$(FRONTEND_IMG)

	$(MAKE) restart

migrate:
	@echo "$(YELLOW)--- Running DB Migrations ---$(NC)"
	-kubectl delete job user-account-db-migrate --ignore-not-found
	kubectl apply -f $(K8S_DIR)/migration-job.yaml
	kubectl wait --for=condition=complete --timeout=60s job/user-account-db-migrate
	kubectl logs -l job-name=user-account-db-migrate

status:
	kubectl get pods,svc,ingress,hpa

restart:
	kubectl rollout restart deployment user-account-backend
	kubectl rollout restart deployment ai-backend
	kubectl rollout restart deployment frontend

logs-back:
	kubectl logs -l app=user-account-backend -f

clean:
	kubectl delete -f $(K8S_DIR)/
	-kubectl delete configmap backend-config