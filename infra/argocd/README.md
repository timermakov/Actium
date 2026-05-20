# Argo CD (GitOps)

## Install on VM (minikube)

```bash
kubectl apply -f infra/argocd/namespace.yaml
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm install argocd argo/argo-cd -n argocd \
  --set server.service.type=NodePort \
  --set configs.params."server\.insecure"=true

# Initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

kubectl apply -f infra/argocd/applications/
```

## Flow

1. CI pushes images tagged with `github.sha`.
2. CD workflow commits new tags to `infra/k8s/overlays/production/kustomization.yaml`.
3. Argo CD detects drift and syncs the cluster.

PostgreSQL is **not** managed by Argo CD — see [`../database/README.md`](../database/README.md).
