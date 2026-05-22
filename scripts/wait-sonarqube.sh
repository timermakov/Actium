#!/usr/bin/env bash
# Wait until SonarQube answers before scanner upload (CI from GitHub-hosted runners).
set -euo pipefail

BASE="${SONAR_HOST_URL%/}"
if [ -z "${BASE}" ]; then
  echo "SONAR_HOST_URL is empty" >&2
  exit 1
fi

TRIES="${SONAR_WAIT_TRIES:-18}"
SLEEP="${SONAR_WAIT_SLEEP:-10}"

echo "Waiting for SonarQube at ${BASE} (up to $((TRIES * SLEEP))s)..."

for i in $(seq 1 "${TRIES}"); do
  if curl -sf -m 15 "${BASE}/api/system/status" | grep -q '"status":"UP"'; then
    echo "SonarQube is UP (attempt ${i})"
    exit 0
  fi
  echo "Attempt ${i}/${TRIES}: not ready, sleep ${SLEEP}s..."
  sleep "${SLEEP}"
done

echo "SonarQube unreachable at ${BASE}" >&2
exit 1
