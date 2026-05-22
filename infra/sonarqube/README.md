# SonarQube Local Setup

Локальное развёртывание SonarQube Community Edition для статического анализа кода.

**На сервере (178.154.244.207):** Actium и SonarQube работают в **minikube** (`infra/k8s/`, `make deploy-local`). Файл `docker-compose.local.yaml` — только для локальной машины, не для production VM.

## Быстрый старт

```bash
cd infra/sonarqube

# Запуск SonarQube и PostgreSQL (локально)
docker compose -f docker-compose.local.yaml up -d

# Ожидание готовности (≈2-3 минуты)
docker compose -f docker-compose.local.yaml logs -f sonarqube
```

## Доступ

- **SonarQube UI**: http://localhost:9000
- **Логин по умолчанию**: `admin` / `admin`

## Настройка проектов

### 1. Создание токенов

После первого входа:
1. My Account → Security → Generate Tokens
2. Создайте Project Analysis Token для каждого проекта:
   - `actium-user-account-srv`
   - `actium-web`
   - `actium-ai-srv`

### 2. Настройка Quality Gate

По умолчанию SonarQube Way проверяет:
- 0 новых багов
- 0 новых уязвимостей
- Code Coverage ≥ 80%
- Duplicated Lines ≤ 3%

Настроить: Administration → Quality Gates → SonarQube Way

### 3. Локальный скан

```bash
# Запуск сканера (предварительно создайте проект и токен в UI)
docker compose -f docker-compose.local.yaml --profile scanner run --rm sonar-scanner \
  -Dsonar.projectKey=actium-user-account-srv \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://sonarqube:9000 \
  -Dsonar.token=YOUR_TOKEN
```

## CI/CD Интеграция

Для GitHub Actions добавьте secrets:
- `SONAR_HOST_URL`: `http://178.154.244.207:9090` (сервер) или `http://localhost:9000` (port-forward)
- `SONAR_TOKEN_USER_ACCOUNT`: токен для Go проекта
- `SONAR_TOKEN_WEB`: токен для frontend
- `SONAR_TOKEN_AI`: токен для AI backend

## Требования к системе

- **RAM**: минимум 4GB (рекомендуется 8GB+)
- **CPU**: 2+ cores
- **Disk**: 10GB+ свободного места

## Остановка и очистка

```bash
# Остановка
docker compose -f docker-compose.local.yaml down

# Полная очистка (удаление volumes)
docker compose -f docker-compose.local.yaml down -v
```

## Устранение неполадок

### SonarQube не стартует

```bash
# Проверьте логи
docker compose -f docker-compose.local.yaml logs sonarqube

# Увеличьте limits (Linux/macOS)
sudo sysctl -w vm.max_map_count=262144
```

### Низкая производительность

Увеличьте ресурсы в `docker-compose.local.yaml`:
```yaml
environment:
  SONAR_WEB_JAVAOPTS: "-Xmx4096m -Xms1024m"
```

## Облачная альтернатива

Для production используйте:
- [SonarCloud](https://sonarcloud.io) (бесплатно для open source)
- SonarQube Data Center Edition
