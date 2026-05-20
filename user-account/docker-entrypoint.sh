#!/bin/sh
set -e

if [ -n "${DB_HOST}" ] && [ -n "${DB_USER}" ] && [ -n "${DB_NAME}" ]; then
  DSN="host=${DB_HOST} port=${DB_PORT:-5432} user=${DB_USER} password=${DB_PASSWORD} dbname=${DB_NAME} sslmode=disable"
  i=1
  while [ "$i" -le 30 ]; do
    if /app/goose -dir /app/migrations postgres "$DSN" up; then
      break
    fi
    echo "Migration attempt $i failed, retrying..."
    sleep 2
    i=$((i + 1))
  done
fi

exec ./app-bin
