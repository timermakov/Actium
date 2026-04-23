# --- ПЕРЕМЕННЫЕ (Всегда в начале) ---
BACKEND_DIR = user-account
FRONTEND_DIR = templater
K8S_DIR = k8s
CONFIG_FILE = .env.local
IMAGE_TAG = latest

# Имена образов
BACKEND_IMG  = tsermakov/actium-user-account-backend:$(IMAGE_TAG)
AI_IMG       = tsermakov/actium-ai-backend:$(IMAGE_TAG)
FRONTEND_IMG = tsermakov/actium-templater-frontend:$(IMAGE_TAG)

.PHONY: run run-together stop clean push-cloud docker-buildx push-local-image \
        all start-minikube build deploy status logs-back hpa-watch reset-backend-db

# --- ГЛАВНЫЕ КОМАНДЫ DOCKER COMPOSE ---
run:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local up -d --build --renew-anon-volumes

stop:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local down
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local down

reset-backend-db:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local down -v
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build

# --- СБОРКА И ПУШ В ОБЛАКО (Docker Hub) ---
docker-buildx:
	docker buildx build --platform linux/amd64 -t $(BACKEND_IMG) --load ./user-account
	docker buildx build --platform linux/amd64 -t $(AI_IMG) --load ./$(FRONTEND_DIR)/apps/api
	docker buildx build --platform linux/amd64 \
		--build-arg VITE_API_BASE_URL=$$(grep VITE_API_BASE_URL $(CONFIG_FILE) | cut -d '=' -f2) \
		-t $(FRONTEND_IMG) --load ./$(FRONTEND_DIR)/apps/web

push-cloud:
	docker buildx build --platform linux/amd64 -t $(BACKEND_IMG) --push ./user-account
	docker buildx build --platform linux/amd64 -t $(AI_IMG) --push ./$(FRONTEND_DIR)/apps/api
	docker buildx build --platform linux/amd64 \
		--build-arg VITE_API_BASE_URL=$$(grep VITE_API_BASE_URL $(CONFIG_FILE) | cut -d '=' -f2) \
		-t $(FRONTEND_IMG) --push ./$(FRONTEND_DIR)/apps/web

push-local-image:
	@echo "--- Building all images from scratch (No Cache) ---"
	docker build --no-cache -t $(BACKEND_IMG) ./$(BACKEND_DIR)
	docker build --no-cache -t $(AI_IMG) ./$(FRONTEND_DIR)/apps/api
	docker build --no-cache \
		--build-arg VITE_API_BASE_URL=$(VITE_API_URL) \
		-t $(FRONTEND_IMG) ./$(FRONTEND_DIR)/apps/web

	@echo "--- Loading all images into Minikube with overwrite ---"
	minikube image load $(BACKEND_IMG) --overwrite=true
	minikube image load $(AI_IMG) --overwrite=true
	minikube image load $(FRONTEND_IMG) --overwrite=true
	@echo "--- Done! All images updated in Minikube ---"

# --- KUBERNETES ---

all: start-minikube push-local-image deploy status

start-minikube:
	minikube start --driver=docker
	minikube addons enable metrics-server
	minikube addons enable ingress

deploy:
	@echo "--- Deploying to K8s ---"
	-kubectl delete configmap backend-config
	kubectl create configmap backend-config --from-env-file=$(CONFIG_FILE)
	kubectl apply -f $(K8S_DIR)/postgres.yaml
	kubectl apply -f $(K8S_DIR)/user-backend.yaml
	kubectl apply -f $(K8S_DIR)/ai-backend.yaml
	kubectl apply -f $(K8S_DIR)/frontend.yaml
	kubectl apply -f $(K8S_DIR)/ingress.yaml
status:
	kubectl get pods
	kubectl get svc
	kubectl get hpa
	kubectl get ingress

restart:
	@echo "--- Restarting all deployments ---"
	kubectl rollout restart deployment user-account-backend
	kubectl rollout restart deployment ai-backend
	kubectl rollout restart deployment frontend

hpa-watch:
	kubectl get hpa user-backend-hpa -w

logs-back:
	kubectl logs -l app=user-account-backend -f

clean:
	kubectl delete -f $(K8S_DIR)/
	kubectl delete configmap backend-config