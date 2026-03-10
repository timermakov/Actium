.PHONY: run stop logs rebuild ps run-all

run-docker:
	docker compose --env-file .env.local up -d --build

run-frontend:
	cd apps/web && npm install && npm run dev

run: run-docker run-frontend

stop:
	docker compose --env-file .env.local down

logs:
	docker compose --env-file .env.local logs -f

rebuild:
	docker compose --env-file .env.local build --no-cache

ps:
	docker compose --env-file .env.local ps