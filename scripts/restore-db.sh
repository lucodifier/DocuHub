#!/bin/bash

# Script de restauração do banco de dados
# Uso: ./scripts/restore-db.sh [caminho-do-backup.db]
# IMPORTANTE: Este script COPIA o backup (não move/apaga o arquivo original)

# Detectar container automaticamente (por nome ou imagem)
CONTAINER_NAME="${CONTAINER_NAME:-docuhub}"
# Buscar por nome primeiro, depois por imagem
CONTAINER_ID="${CONTAINER_ID:-$(docker ps -q --filter "name=${CONTAINER_NAME}" | head -n 1)}"
if [ -z "$CONTAINER_ID" ]; then
    # Se não encontrou por nome, buscar por imagem
    CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)
fi

# Verificar se foi fornecido um arquivo de backup
if [ -z "$1" ]; then
    echo "❌ Erro: Forneça o caminho do arquivo de backup"
    echo "Uso: ./scripts/restore-db.sh [caminho-do-backup.db]"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/restore-db.sh backups/documentation-EMERGENCY-20251117-204912.db"
    echo "  ./scripts/restore-db.sh ~/Docker/repos/documentation/backups/documentation-EMERGENCY-20251117-204912.db"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se o arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo de backup não encontrado: $BACKUP_FILE"
    echo ""
    echo "Verificando caminho absoluto..."
    if [ ! -f "$(realpath "$BACKUP_FILE" 2>/dev/null || echo "$BACKUP_FILE")" ]; then
        echo "   Tentando: $(realpath "$BACKUP_FILE" 2>/dev/null || echo "$BACKUP_FILE")"
    fi
    exit 1
fi

# Verificar se o container está rodando
if docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    CONTAINER_TO_USE="$CONTAINER_NAME"
    echo "✅ Container encontrado por nome: $CONTAINER_NAME"
elif [ -n "$CONTAINER_ID" ] && docker ps --format "{{.ID}}" | grep -q "^${CONTAINER_ID}$"; then
    CONTAINER_TO_USE="$CONTAINER_ID"
    CONTAINER_INFO=$(docker ps --format "{{.Names}} ({{.ID}})" --filter "id=${CONTAINER_ID}")
    echo "✅ Container encontrado por imagem: $CONTAINER_INFO"
else
    echo "❌ Container não encontrado ou não está rodando."
    echo ""
    echo "Containers rodando com imagem documentation:"
    docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Image}}" --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" || echo "   Nenhum container encontrado"
    echo ""
    echo "💡 Dica: Após deploy, o container pode ter novo ID. O script detecta automaticamente."
    echo "   Ou use: CONTAINER_ID=SEU_ID ./scripts/restore-db.sh [backup.db]"
    exit 1
fi

echo "📦 Restaurando banco de dados..."
echo "   Container: $CONTAINER_TO_USE"
echo "   Backup: $BACKUP_FILE"
echo "   ⚠️  O arquivo original será PRESERVADO (cópia, não move)"
echo ""

# Fazer backup de segurança do banco atual antes de restaurar
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$(dirname "$BACKUP_FILE")"
SAFETY_BACKUP="${BACKUP_DIR}/documentation-before-restore-${TIMESTAMP}.db"

echo "🛡️  Criando backup de segurança do banco atual..."
if docker cp "${CONTAINER_TO_USE}:/app/data/documentation.db" "$SAFETY_BACKUP" 2>/dev/null; then
    echo "   ✅ Backup de segurança criado: $SAFETY_BACKUP"
else
    echo "   ⚠️  Aviso: Não foi possível criar backup de segurança (banco pode não existir)"
fi

# COPIAR backup para o container (não move, preserva original)
echo ""
echo "📥 Copiando backup para o container (arquivo original será preservado)..."
docker cp "$BACKUP_FILE" "${CONTAINER_TO_USE}:/app/data/documentation.db"

if [ $? -eq 0 ]; then
    echo "✅ Arquivo copiado com sucesso!"
    
    # Corrigir permissões do arquivo (usuário nextjs precisa de escrita)
    echo ""
    echo "🔧 Corrigindo permissões do banco de dados..."
    docker exec -u root "${CONTAINER_TO_USE}" chown nextjs:nodejs /app/data/documentation.db 2>/dev/null || \
    docker exec "${CONTAINER_TO_USE}" sh -c "chown 1001:1001 /app/data/documentation.db 2>/dev/null || true"
    
    # Garantir permissões de escrita
    docker exec -u root "${CONTAINER_TO_USE}" chmod 664 /app/data/documentation.db 2>/dev/null || \
    docker exec "${CONTAINER_TO_USE}" sh -c "chmod 664 /app/data/documentation.db 2>/dev/null || true"
    
    echo "✅ Permissões corrigidas!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Reinicie o container para aplicar as mudanças e rodar migrações:"
    echo "      docker restart $CONTAINER_TO_USE"
    echo ""
    echo "   2. Verifique os logs para confirmar que a migração rodou:"
    echo "      docker logs -f $CONTAINER_TO_USE"
    echo ""
    echo "   3. A migração vai:"
    echo "      ✅ Remover FK de category_id (preservando dados)"
    echo "      ✅ Remover tabela categories (preservando dados)"
    echo "      ✅ Manter todos os documentos intactos"
    echo ""
    echo "🛡️  Arquivos preservados:"
    echo "   - Backup original: $BACKUP_FILE (INTACTO)"
    if [ -f "$SAFETY_BACKUP" ]; then
        echo "   - Backup de segurança: $SAFETY_BACKUP"
    fi
else
    echo "❌ Erro ao restaurar banco de dados"
    exit 1
fi

