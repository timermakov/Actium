# Релизы Actium (версии по сервисам)

Версии хранятся в [`versions.yaml`](../versions.yaml) — **отдельный SemVer** для каждого образа:

| Ключ | Сервис | Docker image |
|------|--------|----------------|
| `user-account` | Go API | `actium-user-account-backend` |
| `frontend` | React UI | `actium-templater-frontend` |
| `ai-backend` | FastAPI AI | `actium-ai-backend` |

## Локально

```bash
make version                    # все версии
make bump-minor-frontend        # frontend 1.2.0 → 1.3.0
make bump-patch-backend         # user-account patch
make deploy-local               # sync-image-tags из versions.yaml + deploy
```

`scripts/version.sh`:

```bash
./scripts/version.sh show user-account
./scripts/version.sh image-tag frontend    # v1.2.0
./scripts/version.sh bump patch ai-backend
```

На git-теге `backend/v1.2.0` для `user-account` берётся версия из тега (см. `git checkout backend/v1.2.0`).

## Kustomize

В overlay у каждого образа **свой** `newTag`:

```yaml
images:
  - name: tsermakov/actium-user-account-backend
    newTag: v1.1.0
  - name: tsermakov/actium-templater-frontend
    newTag: v1.2.0
  - name: tsermakov/actium-ai-backend
    newTag: v1.0.0
```

Обновление:

```bash
# все сервисы из versions.yaml
./scripts/kustomize-set-image-tags.sh production tsermakov

# один сервис
./scripts/kustomize-set-image-tags.sh minikube tsermakov \
  --service frontend --tag v1.3.0

# CI: один SHA на все (master)
./scripts/kustomize-set-image-tags.sh production tsermakov --sha abc1234
```

## Git-теги и GitHub Actions

| Тег | Что релизится |
|-----|----------------|
| `backend/v1.2.0` | только user-account (`versions.yaml` должен содержать `user-account: "1.2.0"`) |
| `frontend/v1.3.0` | только frontend |
| `ai/v1.0.5` | только ai-backend |
| `release/v1.0.0` | **все три** образа с версиями из `versions.yaml` (номер bundle не обязан совпадать с версиями сервисов) |

Пример — релиз только фронта:

```bash
# в versions.yaml: frontend: "1.3.0"
git add versions.yaml
git commit -m "chore: bump frontend to 1.3.0"
git tag frontend/v1.3.0
git push origin master --tags
```

Пример — релиз всего стека:

```bash
git tag release/v2025.05.22
git push origin release/v2025.05.22
```

Workflow [`release.yml`](../.github/workflows/release.yml) пушит образы, обновляет kustomize (один или все сервиса), создаёт GitHub Release.

## CI / CD (registry → kustomize)

Цепочка на `master`:

1. Тесты → **SonarQube сразу после теста каждого сервиса** (3 job параллельно) → quality gate → **push в Docker Hub**.
2. **CI** читает `versions.yaml` и пушит **каждый** образ с тегами:
   - `v1.1.0` / `1.1.0` (из yaml)
   - `{git-sha}` / `sha-{git-sha}` (для трассировки)
2. **CD** выставляет в `overlays/production` те же **версионные** теги (`v*`), что уже в registry.
3. Кластер / Argo CD тянет образы **по версии**, не по SHA.

| Событие | Образы в registry | Kustomize production |
|---------|-------------------|----------------------|
| Push `master` | `v*` + `sha` per service | CD → теги из `versions.yaml` |
| Тег `backend/v*` … | релиз одного/всех сервисов | release.yml → bump overlay |

Ручной прогон: Actions → **CI** → `workflow_dispatch` (опционально skip registry push).

## Деплой на VM

```bash
git pull
make deploy-local   # подтянет три разных тега из versions.yaml
```

## Секреты

`DOCKERHUB_*`, опционально `GH_PAT` для push коммита kustomize.

## Где видна версия

| Место | Что видите |
|-------|------------|
| Репозиторий | [`versions.yaml`](../versions.yaml) — источник правды |
| Локально | `make version` / `scripts/version.sh show <service>` |
| **SonarQube UI** | Проект → **Project Information** → **Version**; в **Activity** у анализа — версия (`sonar.projectVersion`, в CI из `versions.yaml`) |
| Docker Hub | Теги `tsermakov/actium-*:v1.1.0` и т.д. |
| Kubernetes | `kustomization.yaml` → `newTag: v1.x` |
| GitHub | Releases по тегам `backend/v*`, `frontend/v*`, `ai/v*` |

CI передаёт в Sonar: `-Dsonar.projectVersion=` из `versions.yaml` (важнее, чем `sonar-project.properties`).
