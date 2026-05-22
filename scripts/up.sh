#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}» Building and starting containers...${NC}"
docker compose up --build -d

echo -e "${GREEN}» Done. Services:${NC}"
docker compose ps
