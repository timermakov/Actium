# PostgreSQL on VM host (optional)

Запуск PostgreSQL в Docker **на хосте** — альтернатива in-cluster StatefulSet ([`../k8s/README.md`](../k8s/README.md)). По умолчанию `make deploy` поднимает БД **в Kubernetes** (StatefulSet + PVC).

Используйте host DB, если нужна БД вне кластера (например, одна БД на несколько сред или ручной доступ с хоста).

## One-time setup (VM or Windows)

```bash
# from repository root (not ~/)
cd infra/database
cp .env.db.example .env.db   # Windows: copy .env.db.example .env.db
# edit .env.db with strong passwords
docker compose --env-file .env.db up -d
docker compose --env-file .env.db ps
```

Always pass `--env-file .env.db` for `ps` / `logs` — otherwise compose warns about empty `DB_*` variables.

## Minikube connection (host DB mode)

В `.env.local`:

```env
DB_HOST=host.minikube.internal
```

```bash
make db-host-up
```

> Штатный деплой: `DB_HOST=postgres.actium-database.svc.cluster.local`, `make deploy` (StatefulSet в кластере). Не смешивайте host DB и in-cluster Postgres без смены `DB_HOST`.

## Do not

- Одновременно поднимать host Postgres и in-cluster StatefulSet на одном порту 5432 без необходимости.
- Expose port 5432 in Terraform security group to the public internet.
