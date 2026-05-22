#!/bin/bash
# Test SonarQube scan locally

# User Account (Go)
echo "Scanning User Account (Go)..."
docker run --rm --network=host \
  -e SONAR_HOST_URL=http://localhost:9000 \
  -e SONAR_TOKEN=squ_9e5c31b78783b7352c81d33b976123871d68a766 \
  -v "$(pwd)/user-account:/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=actium-user-account \
  -Dsonar.sources=. \
  -Dsonar.go.coverage.reportPaths=coverage.xml

# Web Frontend (TypeScript)
echo "Scanning Web Frontend (TypeScript)..."
docker run --rm --network=host \
  -e SONAR_HOST_URL=http://localhost:9000 \
  -e SONAR_TOKEN=squ_a4d2b7763389aceb6ce8211acfc73bcbc7dc61cc \
  -v "$(pwd)/templater/apps/web:/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=actium-web \
  -Dsonar.sources=src \
  -Dsonar.tests=tests \
  -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
