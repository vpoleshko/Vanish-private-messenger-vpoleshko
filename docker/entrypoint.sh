#!/usr/bin/env bash
set -euo pipefail

echo "» Copying frontend..."
cp -r /app/static_baked/. /app/app/static/

echo "» Running migrations..."
if ! alembic upgrade head 2>&1; then
  echo "» Migration failed — resetting alembic version and retrying..."
  alembic stamp base 2>/dev/null || true
  alembic upgrade head
fi

echo "» Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
