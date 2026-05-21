# PostgreSQL on VM host (outside Kubernetes)

Database runs in Docker on the VM host so data survives cluster redeploys and Argo CD prune.

## One-time setup on VM

```bash
cd ~/Actium/infra/database
cp .env.db.example .env.db
# edit .env.db with strong passwords
docker compose --env-file .env.db up -d
docker compose ps
```

## Minikube connection

Kubernetes workloads use `DB_HOST=host.minikube.internal` (port 5432 on the host).

If connection fails on Linux:

```bash
minikube ssh -- grep host.minikube.internal /etc/hosts
# or use host gateway IP from: docker network inspect minikube
```

## Do not

- Apply `k8s/postgres.yaml` (deprecated in-cluster DB).
- Expose port 5432 in Terraform security group to the public internet.
