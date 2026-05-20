# Deprecated path

Kubernetes manifests moved to [`infra/k8s/`](../infra/k8s/).

- Local / Minikube: `make deploy` uses `infra/k8s/overlays/minikube`
- Production (Argo CD): `infra/k8s/overlays/production`

Do not edit files here for new changes; update `infra/k8s/base/` instead.
