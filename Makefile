BACKEND_DIR = user-account
FRONTEND_DIR = templater/apps/web

.PHONY: run stop clean

# ГЛАВНАЯ КОМАНДА
run:
	@echo "--- Starting Backend (Docker) ---"
	cd $(BACKEND_DIR) && docker compose --env-file .env.local up -d --build
	@echo "--- Preparing Frontend ---"
	cd $(FRONTEND_DIR) && npm install
	@echo "--- Launching Frontend (Vite) ---"
	cd $(FRONTEND_DIR) && npm run dev

stop:
	@echo "--- Stopping Services ---"
	cd $(BACKEND_DIR) && docker compose down