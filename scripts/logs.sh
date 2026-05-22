#!/usr/bin/env bash
# Usage: ./scripts/logs.sh          — all services
#        ./scripts/logs.sh app      — only app
#        ./scripts/logs.sh db       — only mysql
set -euo pipefail

SERVICE="${1:-}"
docker compose logs -f --tail=100 $SERVICE
