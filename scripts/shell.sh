#!/usr/bin/env bash
# Usage: ./scripts/shell.sh         — shell in app container
#        ./scripts/shell.sh db      — shell in mysql container
set -euo pipefail

SERVICE="${1:-app}"

case "$SERVICE" in
  app)   docker compose exec app bash ;;
  db)    docker compose exec db mysql -u"${MYSQL_USER:-vanish}" -p"${MYSQL_PASSWORD:-vanishpass}" "${MYSQL_DB:-vanish}" ;;
  redis) docker compose exec redis redis-cli ;;
  *)     docker compose exec "$SERVICE" bash ;;
esac
