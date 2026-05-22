#!/usr/bin/env bash
# Generates poetry.lock inside a throw-away container (no local Python needed)
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}» Generating poetry.lock via Docker...${NC}"

docker run --rm \
  -v "$(pwd)":/app \
  -w /app \
  python:3.12-slim \
  bash -c "pip install -q poetry==1.8.4 && poetry lock --no-update"

echo -e "${GREEN}» poetry.lock generated. Now run ./scripts/up.sh${NC}"
