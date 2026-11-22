#!/bin/bash

# Script para corrigir permissões do banco de dados
# Uso: ./scripts/fix-db-permissions.sh

# Detectar container automaticamente
CONTAINER_NAME="${CONTAINER_NAME:-docuhub}"
CONTAINER_ID="${CONTAINER_ID:-$(docker ps -q --filter "name=${CONTAINER_NAME}" | head -n 1)}"
if [ -z "$CONTAINER_ID" ]; then
    CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)
fi

# Verificar se o container está rodando
if docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    CONTAINER_TO_USE="$CONTAINER_NAME"
elif [ -n "$CONTAINER_ID" ] && docker ps --format "{{.ID}}" | grep -q "^${CONTAINER_ID}$"; then
    CONTAINER_TO_USE="$CONTAINER_ID"
else
    echo "❌ Container não encontrado ou não está rodando."
    docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Image}}" --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" || echo "   Nenhum container encontrado"
    exit 1
fi

echo "🔧 Corrigindo permissões do banco de dados..."
echo "   Container: $CONTAINER_TO_USE"
echo ""

# Verificar permissões atuais
echo "📋 Permissões atuais:"
docker exec ${CONTAINER_TO_USE} ls -lh /app/data/documentation.db 2>/dev/null || echo "   ⚠️  Arquivo não encontrado"

# Corrigir permissões do diretório
echo ""
echo "🔧 Corrigindo permissões do diretório /app/data..."
docker exec -u root ${CONTAINER_TO_USE} chown -R nextjs:nodejs /app/data 2>/dev/null || \
docker exec ${CONTAINER_TO_USE} sh -c "chown -R 1001:1001 /app/data 2>/dev/null || true"

# Corrigir permissões do arquivo do banco
echo "🔧 Corrigindo permissões do arquivo documentation.db..."
docker exec -u root ${CONTAINER_TO_USE} chown nextjs:nodejs /app/data/documentation.db 2>/dev/null || \
docker exec ${CONTAINER_TO_USE} sh -c "chown 1001:1001 /app/data/documentation.db 2>/dev/null || true"

# Garantir permissões de escrita (rw-rw-r--)
docker exec -u root ${CONTAINER_TO_USE} chmod 664 /app/data/documentation.db 2>/dev/null || \
docker exec ${CONTAINER_TO_USE} sh -c "chmod 664 /app/data/documentation.db 2>/dev/null || true"

# Garantir permissões do diretório (rwxrwxr-x)
docker exec -u root ${CONTAINER_TO_USE} chmod 775 /app/data 2>/dev/null || \
docker exec ${CONTAINER_TO_USE} sh -c "chmod 775 /app/data 2>/dev/null || true"

echo ""
echo "✅ Permissões corrigidas!"
echo ""
echo "📋 Permissões finais:"
docker exec ${CONTAINER_TO_USE} ls -lh /app/data/documentation.db 2>/dev/null
docker exec ${CONTAINER_TO_USE} ls -ld /app/data 2>/dev/null

echo ""
echo "💡 Se ainda não funcionar, reinicie o container:"
echo "   docker restart ${CONTAINER_TO_USE}"

