#!/bin/bash
# Скрипт для инициализации проектов в SonarQube
# Требует jq и curl

set -e

SONAR_URL="${SONAR_HOST_URL:-http://localhost:9000}"
SONAR_USER="${SONAR_USER:-admin}"
SONAR_PASS="${SONAR_PASS:-admin}"

# Проекты для создания
PROJECTS=(
  "actium-user-account-srv:Actium User Account Srv (Go)"
  "actium-web:Actium Web Frontend (TypeScript/React)"
  "actium-ai-srv:Actium AI Srv (Python/FastAPI)"
)

echo "Initializing SonarQube projects at $SONAR_URL"

# Ждём готовности SonarQube
echo "Waiting for SonarQube to be ready..."
until curl -s -o /dev/null -w "%{http_code}" "$SONAR_URL/api/system/status" | grep -q "200\|401"; do
  sleep 5
  echo "  Still waiting..."
done
echo "SonarQube is ready"

# Авторизация (базовая для первого входа)
AUTH="$SONAR_USER:$SONAR_PASS"

# Создание проектов
for project in "${PROJECTS[@]}"; do
  IFS=':' read -r key name <<< "$project"

  echo "Creating project: $name ($key)"

  # Создание проекта
  curl -s -X POST \
    -u "$AUTH" \
    "$SONAR_URL/api/projects/create" \
    -d "name=$name" \
    -d "project=$key" \
    -d "visibility=private" \
    -o /dev/null || echo "  Project might already exist"

  # Создание токена
  echo "  Generating token..."
  TOKEN_RESPONSE=$(curl -s -X POST \
    -u "$AUTH" \
    "$SONAR_URL/api/user_tokens/generate" \
    -d "name=github-actions-$key" \
    -d "type=PROJECT_ANALYSIS_TOKEN" \
    -d "projectKey=$key" 2>/dev/null || echo '{}')

  TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)
  if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "  Token: $TOKEN"
    echo "     Add to GitHub Secrets: SONAR_TOKEN_$(echo $key | tr '[:lower:]-' '[:upper:]_')"
  else
    echo "  Warning: could not generate token (might already exist)"
  fi
done

# Настройка Quality Gate с coverage 80%
echo ""
echo "Configuring Quality Gate..."

# Получаем ID SonarQube Way
QG_ID=$(curl -s -u "$AUTH" "$SONAR_URL/api/qualitygates/show?name=SonarQube%20Way" | jq -r '.id // empty')

if [ -n "$QG_ID" ]; then
  # Добавляем условие на coverage 80%
  curl -s -X POST \
    -u "$AUTH" \
    "$SONAR_URL/api/qualitygates/create_condition" \
    -d "gateId=$QG_ID" \
    -d "metric=coverage" \
    -d "op=LT" \
    -d "error=80" \
    -o /dev/null || echo "  Coverage condition might already exist"

  echo "Quality Gate configured with 80% coverage requirement"
fi

echo ""
echo "SonarQube setup complete."
echo ""
echo "Next steps:"
echo "1. Login to $SONAR_URL"
echo "2. Add generated tokens to GitHub Secrets"
echo "3. Run CI pipeline to see first analysis"
