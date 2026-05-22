#!/usr/bin/env bash
# Usage: ./scripts/makemigration.sh "add users table"
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

MESSAGE="${1:-}"
if [[ -z "$MESSAGE" ]]; then
  echo "Usage: $0 \"migration message\""
  exit 1
fi

echo -e "${GREEN}» Generating migration: \"$MESSAGE\"${NC}"
docker compose exec app alembic revision --autogenerate -m "$MESSAGE"
