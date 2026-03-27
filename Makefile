BACKEND_DIR = user-account
FRONTEND_DIR = templater

.PHONY: run run-together stop reset-backend-db clean

# ГЛАВНАЯ КОМАНДА
run:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local up -d --build --renew-anon-volumes

run-together:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local pull
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --no-build
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local pull
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local up -d --no-build --renew-anon-volumes
stop:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local down
	cd $(FRONTEND_DIR) && docker compose --env-file ../.env.local down

reset-backend-db:
	cd $(BACKEND_DIR) && docker compose --env-file .env.local down -v
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build

push-cloud:
	docker compose --env-file .env.local build
	docker push mgfallen/docflow-go:latest
	docker push mgfallen/docflow-python:latest
	docker push mgfallen/docflow-frontend:latest