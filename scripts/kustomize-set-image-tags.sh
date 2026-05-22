#!/usr/bin/env bash
# Set image tags in a kustomize overlay.
#
# All services from versions.yaml:
#   kustomize-set-image-tags.sh <overlay> [namespace]
#
# Uniform tag (CI/CD commit SHA):
#   kustomize-set-image-tags.sh <overlay> [namespace] --sha <tag>
#
# Single service:
#   kustomize-set-image-tags.sh <overlay> [namespace] --service user-account --tag v1.2.0
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OVERLAY="${1:?overlay required (minikube|production)}"
shift

NAMESPACE="tsermakov"
MODE="versions"
SERVICE=""
TAG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --sha)
      MODE="uniform"
      TAG="${2:?--sha requires tag}"
      shift 2
      ;;
    --service)
      MODE="single"
      SERVICE="${2:?--service requires name}"
      shift 2
      if [ "${1:-}" != "--tag" ]; then
        echo "--service requires --tag" >&2
        exit 1
      fi
      TAG="${2:?--tag requires value}"
      shift 2
      ;;
    *)
      NAMESPACE="$1"
      shift
      ;;
  esac
done

cd "${ROOT}/infra/k8s/overlays/${OVERLAY}"

if ! command -v kustomize >/dev/null 2>&1; then
  echo "kustomize not found in PATH" >&2
  exit 1
fi

image_tag() {
  local svc="$1"
  if [ "${MODE}" = "uniform" ]; then
    echo "${TAG}"
  else
    bash "${ROOT}/scripts/version.sh" image-tag "${svc}"
  fi
}

set_one() {
  local svc="$1"
  local tag="$2"
  local image=""
  case "${svc}" in
    user-account) image="actium-user-account-backend" ;;
    frontend) image="actium-templater-frontend" ;;
    ai-backend) image="actium-ai-backend" ;;
    *) echo "unknown service: ${svc}" >&2; exit 1 ;;
  esac
  kustomize edit set image \
    "${NAMESPACE}/${image}=${NAMESPACE}/${image}:${tag}"
  echo "  ${image}:${tag}"
}

echo "Updating ${OVERLAY} (${NAMESPACE}):"

if [ "${MODE}" = "single" ]; then
  set_one "${SERVICE}" "${TAG}"
elif [ "${MODE}" = "uniform" ]; then
  set_one user-account "${TAG}"
  set_one ai-backend "${TAG}"
  set_one frontend "${TAG}"
else
  set_one user-account "$(image_tag user-account)"
  set_one ai-backend "$(image_tag ai-backend)"
  set_one frontend "$(image_tag frontend)"
fi

echo "Done."
