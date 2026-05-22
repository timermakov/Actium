#!/usr/bin/env bash
# Normalize SONAR_HOST_URL for sonar-scanner (fixes http:/host, http:///host, missing scheme).
set -euo pipefail

if [ -z "${SONAR_HOST_URL:-}" ]; then
  echo "SONAR_HOST_URL is empty" >&2
  exit 1
fi

url="${SONAR_HOST_URL}"
url="$(printf '%s' "$url" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
url="${url%/}"

# http:/host:port -> http://host:port
if [[ "$url" =~ ^https?:/[^/] ]]; then
  url="$(printf '%s' "$url" | sed -E 's|^(https?):/([^/])|\1://\2|')"
fi

# http:///host -> http://host
url="$(printf '%s' "$url" | sed -E 's|^(https?://)/+|\1|')"

# /178.154.244.207:9090 or /host -> http://host
if [[ "$url" == /* ]]; then
  url="http://${url#/}"
fi

# 178.154.244.207:9090 -> http://...
if [[ ! "$url" =~ ^https?:// ]]; then
  url="http://${url}"
fi

if [[ ! "$url" =~ ^https?://[^/]+ ]]; then
  echo "Invalid SONAR_HOST_URL after normalize: ${url}" >&2
  echo "Set GitHub secret to exactly: http://178.154.244.207:9090" >&2
  exit 1
fi

if [ -n "${GITHUB_ENV:-}" ]; then
  echo "SONAR_HOST_URL=${url}" >> "${GITHUB_ENV}"
fi

echo "SONAR_HOST_URL=${url}"
