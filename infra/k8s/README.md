# Kubernetes manifests (Kustomize)

| Path | Use |
|------|-----|
| `base/` | Shared manifests (no postgres — DB on host) |
| `overlays/minikube/` | `make deploy` / local cluster |
| `overlays/production/` | Argo CD GitOps target |

## Deploy locally

```bash
make db-host-up   # optional if DB already running
make deploy-local
```

```bash
make deploy
```

or one-time recreate workloads:

```bash
make reset-k8s-workloads
make deploy
```

## Secrets

`make deploy` creates `backend-secrets` from `.env.local`. Do not commit real `.env.local`.

## Argo CD

See [`../argocd/README.md`](../argocd/README.md).
