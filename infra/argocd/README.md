# Argo CD (GitOps)

## Install on VM (minikube)

```bash
kubectl apply -f infra/argocd/namespace.yaml
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm install argocd argo/argo-cd -n argocd --set server.service.type=NodePort  --set configs.params."server\.insecure"=true

# Initial admin password (Linux/macOS)
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Initial admin password (PowerShell)
$p = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($p))

# UI access (pick one)
kubectl port-forward svc/argocd-server -n argocd 8080:80
# open http://localhost:8080  user: admin

# Or NodePort (minikube)
minikube service argocd-server -n argocd --url

# Lab (before infra/k8s is on master):
kubectl apply -f infra/argocd/applications/actium-minikube.yaml

# Production (after feature/devops-4 merged to master):
# kubectl apply -f infra/argocd/applications/actium-app.yaml
```

### ComparisonError: `app path does not exist`

Argo CD reads **GitHub**, not your local disk. Application `actium` uses `targetRevision: master` and path `infra/k8s/overlays/production`. That folder exists only after merge of `feature/devops-4` into `master`.

**Until merge** — use the lab Application (branch + minikube overlay):

```powershell
kubectl apply -f infra/argocd/applications/actium-minikube.yaml
```

Or patch the existing app:

```powershell
kubectl -n argocd patch application actium --type merge -p "{\"spec\":{\"source\":{\"targetRevision\":\"feature/devops-4\",\"path\":\"infra/k8s/overlays/minikube\"}}}"
```

Then **Refresh** in the UI.

After merge to master — use `actium-app.yaml` with `targetRevision: master` and `path: infra/k8s/overlays/production`.

## Flow

1. CI pushes images tagged with `github.sha`.
2. CD workflow commits new tags to `infra/k8s/overlays/production/kustomization.yaml`.
3. Argo CD detects drift and syncs the cluster.

PostgreSQL (StatefulSet в `actium-database`, sync-wave `-1`) синхронизируется вместе с приложением. Host DB — опционально: [`../database/README.md`](../database/README.md).
