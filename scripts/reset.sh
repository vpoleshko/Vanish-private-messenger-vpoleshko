#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}» Nuclear reset: stopping containers and wiping volumes...${NC}"
read -r -p "Are you sure? This deletes all DB data. [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

docker compose down -v --remove-orphans
echo -e "${RED}» Done. All volumes removed.${NC}"
