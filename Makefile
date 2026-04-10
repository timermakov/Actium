BACKEND_DIR = user-account
FRONTEND_DIR = templater/apps/web

.PHONY: run run-together stop clean push-cloud docker-buildx

# ГЛАВНАЯ КОМАНДА
run:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build
	cd $(FRONTEND_DIR) && npm install
	cd $(FRONTEND_DIR) && npm run dev

run-together:
	docker compose --env-file .env.local pull
	docker compose --env-file .env.local up -d --no-build
stop:
	docker compose --env-file .env.local down

docker-buildx:
	docker buildx build --platform linux/amd64 -t tsermakov/actium-user-account-backend:latest --load ./user-account
	docker buildx build --platform linux/amd64 -t tsermakov/actium-ai-backend:latest --load ./templater/apps/api
	docker buildx build --platform linux/amd64 --build-arg VITE_API_BASE_URL=$${VITE_API_BASE_URL} -t tsermakov/actium-templater-frontend:latest --load ./templater/apps/web

push-cloud:
	docker buildx build --platform linux/amd64 -t tsermakov/actium-user-account-backend:latest --push ./user-account
	docker buildx build --platform linux/amd64 -t tsermakov/actium-ai-backend:latest --push ./templater/apps/api
	docker buildx build --platform linux/amd64 --build-arg VITE_API_BASE_URL=$${VITE_API_BASE_URL} -t tsermakov/actium-templater-frontend:latest --push ./templater/apps/web