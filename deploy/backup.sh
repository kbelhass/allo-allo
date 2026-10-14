#!/usr/bin/env bash
# Sauvegarde quotidienne de la base PostgreSQL (garde 14 jours). À lancer depuis cron.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
FILE="backups/alloallo_$(date +%F_%H%M).sql.gz"
docker compose exec -T db pg_dump -U alloallo alloallo | gzip > "$FILE"
find backups -name 'alloallo_*.sql.gz' -mtime +14 -delete
echo "Sauvegarde OK : $FILE ($(du -h "$FILE" | cut -f1))"
