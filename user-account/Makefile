# Подгружаем переменные из .env.local, чтобы использовать их в командах
# Файл должен содержать DB_DSN или отдельные переменные (DB_USER, DB_NAME и т.д.)
ifneq (,$(wildcard .env.local))
    include .env.local
    export
endif

# Определяем расширение для Windows
ifeq ($(OS),Windows_NT)
    EXT = .exe
    MKDIR = if not exist bin mkdir bin
else
    EXT =
    MKDIR = mkdir -p bin
endif

# Пути
GOOSE_BIN = $(CURDIR)/bin/goose$(EXT)
JET_BIN = $(CURDIR)/bin/jet$(EXT)
MIGRATIONS_DIR = ./migrations
MOCKS_DEST=cmd/internal/gen/mocks

DB_URL ?= "postgres://$(DB_USER):$(DB_PASSWORD)@localhost:5432/$(DB_NAME)?sslmode=disable"

.PHONY: run stop lint lint-fix tidy install-tools migrate-up migrate-down migrate-status gen-sql gen-mocks

# --- Основные команды Docker ---
run:
	docker compose --env-file .env.local up -d --build

stop:
	docker compose --env-file .env.local down

install-tools:
	@$(MKDIR)
	@echo "Installing tools to ./bin..."
	go env -w GOBIN=$(CURDIR)/bin
	go install github.com/pressly/goose/v3/cmd/goose@latest
	go install github.com/go-jet/jet/v2/cmd/jet@latest
	go env -u GOBIN

gen-mocks:
	@echo "Generating mocks with gomock..."
	if not exist $(MOCKS_DEST) mkdir $(MOCKS_DEST)

	mockgen -source=cmd/internal/handler/auth_handler.go -destination=$(MOCKS_DEST)/mock_auth_service.go -package=mocks
	mockgen -source=cmd/internal/handler/user_handler.go -destination=$(MOCKS_DEST)/mock_user_service.go -package=mocks
	mockgen -source=cmd/internal/repository/user_repository.go -destination=$(MOCKS_DEST)/mock_user_repository.go -package=mocks

	@echo "Mocks generated successfully in $(MOCKS_DEST)"

lint:
	docker compose exec app golangci-lint run

lint-fix:
	docker compose exec app golangci-lint run --fix

tidy:
	docker compose exec app go mod tidy

# --- Миграции (Goose) ---
migrate-up:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) postgres $(DB_URL) up

migrate-down:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) postgres $(DB_URL) down

migrate-status:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) postgres $(DB_URL) status

migrate-create:
	$(GOOSE_BIN) -dir $(MIGRATIONS_DIR) create $(name) sql

gen-sql:
	$(JET_BIN) -dsn=$(DB_URL) -path=./cmd/internal/gen