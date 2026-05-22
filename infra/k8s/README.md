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


## Ingress и `minikube tunnel`

Маршрутизация — через Ingress в `base/ingress-*.yaml` (frontend `/`, API `/api/user`, `/api/ai`, Grafana `/grafana`).

После `make deploy-local` поднимите tunnel (отдельный терминал или systemd):

```bash
minikube tunnel
```

На **удалённой VM** (например 178.154.244.207) tunnel слушает **127.0.0.1:80**. Для доступа с интернета:

1. **systemd tunnel** — шаблон [`systemd/minikube-tunnel.service`](systemd/minikube-tunnel.service)
2. **Публикация :80** — nginx на IP NIC (не loopback) → `127.0.0.1` — шаблон [`nginx/actium-tunnel-publish.conf`](nginx/actium-tunnel-publish.conf) (`BIND_IP` = `hostname -I`)
3. Открыть **TCP 80** в security group облака

Проверка на сервере:

```bash
curl http://127.0.0.1/api/user/health
curl http://127.0.0.1/
```

Локально (Windows): tunnel в отдельном терминале, UI — http://localhost/ (порт 80, не 8080).

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

## Версии образов (Kustomize)

Теги в overlay задаются блоком `images` или скриптом:

```bash
./scripts/kustomize-set-image-tags.sh production tsermakov
./scripts/kustomize-set-image-tags.sh production tsermakov --service frontend --tag v1.3.0
```

Релизы: [`../../docs/RELEASE.md`](../../docs/RELEASE.md), файл [`../../versions.yaml`](../../versions.yaml) (отдельная версия на сервис).

## Argo CD

См. [`../argocd/README.md`](../argocd/README.md).
