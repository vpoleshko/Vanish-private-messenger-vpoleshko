#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}» Running ruff check...${NC}"
docker compose exec app ruff check app

echo -e "${GREEN}» Running ruff format check...${NC}"
docker compose exec app ruff format --check app
