BACKEND_DIR = user-account
FRONTEND_DIR = templater/apps/web

.PHONY: run stop clean

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

push-cloud:
	docker compose --env-file .env.local build
	docker push mgfallen/docflow-go:latest
	docker push mgfallen/docflow-python:latest
	docker push mgfallen/docflow-frontend:latest