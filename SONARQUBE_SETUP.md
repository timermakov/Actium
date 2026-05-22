# SonarQube Setup Guide

## Что уже сделано

### 1. SonarQube на сервере

- UI: http://178.154.244.207:9090/projects
- Локально (minikube): `kubectl port-forward -n sonarqube svc/sonarqube 9000:9000` → http://localhost:9000

### 2. Проекты

| Project key | Описание |
|-------------|----------|
| `actium-user-account` | Go backend |
| `actium-web` | TypeScript/React frontend |
| `actium-ai-backend` | Python/FastAPI AI API |

### 3. GitHub Secrets

| Secret | Назначение |
|--------|------------|
| `SONAR_HOST_URL` | `http://178.154.244.207:9090` |
| `SONAR_TOKEN_USER_ACCOUNT` | Токен анализа для Go |
| `SONAR_TOKEN_WEB` | Токен анализа для frontend |
| `SONAR_TOKEN_AI` | Токен анализа для AI backend |

Токены создаются в SonarQube: **My Account → Security → Generate Tokens** (тип Project Analysis Token).

---

## Добавление секретов в GitHub

1. https://github.com/timermakov/Actium/settings/secrets/actions
2. **New repository secret** для каждого имени из таблицы выше.

Через gh CLI:

```bash
gh auth login
gh secret set SONAR_HOST_URL -b"http://178.154.244.207:9090"
gh secret set SONAR_TOKEN_USER_ACCOUNT -b"<token>"
gh secret set SONAR_TOKEN_WEB -b"<token>"
gh secret set SONAR_TOKEN_AI -b"<token>"
```

---

## Запуск CI

```bash
git push origin feature/devops-4-2
```

Или: Actions → CI → **Run workflow**.

После успешного `ai-backend-test` и шага SonarQube проект `actium-ai-backend` появится в UI.

---

## Доступ к SonarQube UI

### Production (VM)

http://178.154.244.207:9090

Вход: учётная запись admin (пароль задаётся при первом входе, не храните в репозитории).

### Minikube (локально)

```bash
kubectl port-forward -n sonarqube svc/sonarqube 9000:9000
```

http://localhost:9000

Ingress (опционально): http://sonarqube.local — добавьте IP minikube в hosts.

---

## Quality Gate

| Metric | Threshold |
|--------|-----------|
| Coverage | ≥ 80% |
| New violations | 0 |
| Duplication | ≤ 3% |
| Security hotspots | 100% reviewed |

CI завершится с ошибкой, если:

- покрытие < 80%;
- есть новые баги/уязвимости;
- не пройден Quality Gate.

---

## Локальный тест (без CI)

```bash
# Go
docker run --rm --network=host \
  -e SONAR_HOST_URL=http://178.154.244.207:9090 \
  -e SONAR_TOKEN=<token> \
  -v "$(pwd)/user-account:/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=actium-user-account \
  -Dsonar.sources=.

# Web
docker run --rm --network=host \
  -e SONAR_HOST_URL=http://178.154.244.207:9090 \
  -e SONAR_TOKEN=<token> \
  -v "$(pwd)/templater/apps/web:/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=actium-web \
  -Dsonar.sources=src
```

---

## Production (облако)

Для SonarCloud:

1. https://sonarcloud.io
2. Импорт репозитория
3. `SONAR_HOST_URL=https://sonarcloud.io`
4. Один или несколько токенов SonarCloud
