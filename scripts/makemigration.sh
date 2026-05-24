#!/usr/bin/env bash
# Usage: bash scripts/makemigration.sh "add_room_type"
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

MESSAGE="${1:-}"
if [[ -z "$MESSAGE" ]]; then
  echo "Usage: $0 \"migration_name\""
  exit 1
fi

echo -e "${GREEN}» Starting database...${NC}"
docker compose up -d db

echo -e "${GREEN}» Waiting for MySQL...${NC}"
until docker compose exec db mysqladmin ping -h localhost --silent 2>/dev/null; do
  sleep 1
done

echo -e "${GREEN}» Generating migration: \"$MESSAGE\"${NC}"
docker compose run --rm --no-deps --entrypoint "" app alembic revision --autogenerate -m "$MESSAGE"

echo -e "${GREEN}» Done. Check alembic/versions/ for the new file.${NC}"
