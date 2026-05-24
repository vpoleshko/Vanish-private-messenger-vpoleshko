#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${GREEN}» Building frontend...${NC}"

docker run --rm \
  -v "$ROOT/frontend:/frontend" \
  node:20-alpine \
  sh -c "cd /frontend && npm install && npm run build"

echo -e "${GREEN}» Copying to app/static/...${NC}"
rm -rf "$ROOT/app/static"/*
cp -r "$ROOT/frontend/dist"/. "$ROOT/app/static/"

echo -e "${GREEN}» Frontend ready.${NC}"
