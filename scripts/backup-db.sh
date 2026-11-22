#!/bin/bash

BACKUP_DIR="/home/desenvol_dev/Docker/repos/documentation/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/documentation-${TIMESTAMP}.db"

CONTAINER=$(docker ps --format "{{.Names}}" | grep -E '^(documentation|docuhub)$' | head -1)

if [ -z "$CONTAINER" ]; then
    echo "❌ Container não encontrado (documentation ou docuhub)."
    exit 1
fi

echo "📦 Fazendo backup do container '$CONTAINER'..."
docker cp "${CONTAINER}:/app/data/documentation.db" "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Erro ao copiar banco."
    exit 1
fi

gzip "$BACKUP_FILE"
echo "✅ Backup criado: ${BACKUP_FILE}.gz"

# Manter apenas os últimos 10 backups do cron (arquivos .gz)
ls -t "${BACKUP_DIR}"/documentation-*.db.gz 2>/dev/null | tail -n +11 | xargs -r rm
echo "🧹 Backups antigos removidos. Total mantido: $(ls ${BACKUP_DIR}/documentation-*.db.gz 2>/dev/null | wc -l)"
