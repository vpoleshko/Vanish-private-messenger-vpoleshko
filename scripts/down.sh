#!/usr/bin/env bash
set -euo pipefail

YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${YELLOW}» Stopping containers...${NC}"
docker compose down
