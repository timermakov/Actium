# Kubernetes manifests (Kustomize)

| Path | Use |

|------|-----|

| `base/` | Shared manifests |

| `overlays/minikube/` | `make deploy` / local cluster |

| `overlays/production/` | Argo CD GitOps target |

## PostgreSQL

База в namespace `actium-database`: **StatefulSet** + **PVC** (`volumeClaimTemplates`, 5Gi). Данные в томе сохраняются при перезапуске Pod'ов; при удалении только StatefulSet PVC остаётся.

Сервис (headless): `postgres.actium-database.svc.cluster.local:5432`

В `.env.local` для кластера:

```env

DB_HOST=postgres.actium-database.svc.cluster.local

```

`make deploy` создаёт `postgres-credentials` и `backend-secrets` из `.env.local`, ждёт готовности StatefulSet, затем накатывает миграции.

Сброс StatefulSet без потери данных:

```bash
make reset-k8s-postgres
make deploy
```

Полное удаление данных БД:

```bash
make reset-k8s-postgres-data
make deploy
```
Опционально: PostgreSQL на хосте вместо кластера — [../database/README.md](../database/README.md) + `DB_HOST=host.minikube.internal` (без StatefulSet в k8s).


## Deploy locally

```bash
make deploy-local
```

или:

```bash
make deploy
```


При ошибке immutable selector:

```bash
make reset-k8s-workloads
make deploy
```

## Secrets

`make deploy` создаёт `backend-config`, `backend-secrets`, `postgres-credentials` из `.env.local`. Не коммитьте реальный `.env.local`.

## Argo CD

См. [`../argocd/README.md`](../argocd/README.md).
