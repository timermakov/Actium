# Actium

**Actium** — MVP-платформа для массовой генерации юридически значимых документов из шаблонов DOCX: загрузка шаблона (содержит {{плейсхолдеры}}) и данных (CSV/XLSX), сопоставление полей, выдача одного DOCX или ZIP-пакета. Дополнительно — AI-подсказки по данным и маппингу.

| Компонент | Стек | Назначение |
|-----------|------|------------|
| [user-account](user-account/) | Go, PostgreSQL | API учётных записей, JWT, миграции |
| [templater/apps/web](templater/apps/web/) | React, TypeScript, Vite | Веб-интерфейс |
| [templater/apps/api](templater/apps/api/) | Python (FastAPI) | AI-бэкенд |

---

## Структура репозитория

```
Actium/
├── user-account/          # Go-сервис пользователей
├── templater/             # Фронтенд и AI API
├── docker-compose.yaml    # Локальный стек (БД + все сервисы)
├── Makefile               # Сборка, Minikube, деплой
├── .env.local.example     # Шаблон переменных окружения
└── infra/
    ├── database/          # Опционально: PostgreSQL на хосте (вне кластера)
    ├── k8s/               # Манифесты Kustomize (base + overlays)
    ├── argocd/            # GitOps (Argo CD)
    └── terraform/         # Облачная инфраструктура (Yandex Cloud)
```

Подробнее по инфраструктуре: [infra/k8s/README.md](infra/k8s/README.md), [infra/database/README.md](infra/database/README.md), [infra/argocd/README.md](infra/argocd/README.md).

---

## Требования

- [Docker](https://docs.docker.com/get-docker/) и Docker Compose
- [Make](https://www.gnu.org/software/make/) (GNU Make или совместимый)
- Для Kubernetes: [kubectl](https://kubernetes.io/docs/tasks/tools/), [minikube](https://minikube.sigs.k8s.io/docs/start/) (опционально)

---

## Быстрый старт (Docker Compose)

Самый простой способ поднять всё на одной машине.

### 1. Переменные окружения

```bash
cp .env.local.example .env.local
```

Отредактируйте `.env.local`: пароли БД, `JWT_SECRET`, при необходимости порты. Для корневого `docker-compose.yaml` задайте также `WEB_PORT=5173` (порт фронтенда на хосте).

### 2. Запуск

```bash
docker compose --env-file .env.local up -d --build
```

### 3. Миграции БД

```bash
cd user-account
make migrate-up
```

### 4. Проверка

- Фронтенд: `http://localhost:5173` (или значение `WEB_PORT`)
- Health бэкенда: см. [user-account](user-account/)

Остановка:

```bash
docker compose --env-file .env.local down
```

### Альтернатива: отдельные compose-файлы

```bash
make run    # user-account + templater, каждый со своим compose
make stop
```

---

## Разработка без полного стека

| Задача | Команда |
|--------|---------|
| Только бэкенд | `cd user-account && make run` |
| Тесты Go | `cd user-account && go test ./...` |
| Тесты фронта | `cd templater/apps/web && npm run test:ci` |
| Линт Go | `cd user-account && make lint` |

Описание и стек фронта: [templater/README.md](templater/README.md).

---

## Kubernetes (Minikube)

PostgreSQL в кластере: **StatefulSet** + **PVC** в namespace `actium-database` — данные сохраняются при перезапуске Pod'ов. См. [infra/k8s/README.md](infra/k8s/README.md).

### Подготовка

1. Скопировать `.env.local` (для `make deploy` и секретов в кластере).
2. В `.env.local` для Kubernetes:

```env
DB_HOST=postgres.actium-database.svc.cluster.local
```

(значение уже в [.env.local.example](.env.local.example); для Docker Compose на хосте используйте `DB_HOST=db`.)

### Кластер и деплой

```bash
make start-cluster          # minikube + ingress + metrics-server
make deploy-local           # сборка, загрузка образов в minikube, apply + миграции
```

Только apply (образы уже в minikube):

```bash
make deploy
```

Полезные команды:

| Команда | Описание |
|---------|----------|
| `make status` | Pod'ы, сервисы, ingress |
| `make migrate` | Job миграций в кластере |
| `make logs-back` | Логи user-account-srv |
| `make restart` | Перезапуск деплойментов |
| `make clean` | Удаление ресурсов overlay |
| `make reset-k8s-workloads` | Сброс Deployment при ошибке immutable selector |
| `make reset-k8s-postgres` | Удалить StatefulSet Postgres (PVC сохраняется) |
| `make reset-k8s-postgres-data` | Удалить Postgres и PVC (полный сброс БД) |

Манифесты: `infra/k8s/overlays/minikube`. Production overlay — для Argo CD: [infra/argocd/README.md](infra/argocd/README.md).

---

## CI/CD

- **CI** (`.github/workflows/ci.yml`): тесты Go, web, AI; SonarQube; push образов `:sha` в Docker Hub.
- **CD** (`.github/workflows/cd.yml`): после CI на `master` — `kustomize` теги `:sha` в `overlays/production`.
- **Release** (`.github/workflows/release.yml`): теги `backend/v*`, `frontend/v*`, `ai/v*`, `release/v*` — отдельные версии образов. См. [`docs/RELEASE.md`](docs/RELEASE.md), [`versions.yaml`](versions.yaml).
- **Уведомления** (`.github/workflows/notify.yml`): Telegram при сбоях.

Секреты для GitHub Actions: [infra/GITHUB_ACTIONS_SECRETS.md](infra/GITHUB_ACTIONS_SECRETS.md).

---

## Переменные окружения

| Переменная | Назначение |
|------------|------------|
| `DB_*` | Подключение к PostgreSQL |
| `JWT_SECRET` | Подпись JWT (смените в проде) |
| `BACKEND_PORT` | Порт Go API |
| `PYTHON_API_PORT` | Порт AI API |
| `VITE_*` | URL API для сборки фронтенда |

Полный пример: [.env.local.example](.env.local.example).

---

## Пояснение

Учебный / MVP-проект.
Когда происходит релиз на сервер, придерживаемся практик DevSecOps.
Все пароли в .env.example файлах в репозитории тестовые - должны заменяться на безопасные, .env-файлы не должны коммититься.
Обязательно ограничивать доступ к БД, админ-ресурсам и мониторингу.
