#!/usr/bin/env bash
# Usage: ./scripts/migrate.sh              — upgrade to head
#        ./scripts/migrate.sh downgrade -1 — downgrade one step
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

ARGS="${*:-upgrade head}"

echo -e "${GREEN}» Running: alembic $ARGS${NC}"
docker compose exec app alembic $ARGS
