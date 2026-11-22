# 📋 Como Executar os Scripts

## ⚠️ IMPORTANTE: Onde Executar?

Os scripts `.sh` são para **executar no servidor Ubuntu** onde o container Docker está rodando, **NÃO na sua máquina Windows**.

## 🖥️ Opção 1: Executar no Servidor (Recomendado)

### Passo 1: Conectar no Servidor

```bash
# Na sua máquina Windows (Git Bash ou PowerShell)
ssh desenvol_dev@paralogydev
# ou o comando que você usa para acessar o servidor
```

### Passo 2: Ir para o Diretório do Projeto

```bash
# No servidor Ubuntu
cd ~/Docker/repos/documentation
```

### Passo 3: Executar o Script

```bash
# Dar permissão de execução (só na primeira vez)
chmod +x scripts/fix-db-permissions.sh

# Executar o script
./scripts/fix-db-permissions.sh
```

## 🔧 Opção 2: Executar Comandos Manualmente (Sem Script)

Se preferir não usar o script, execute os comandos diretamente no servidor:

```bash
# 1. Conectar no servidor
ssh desenvol_dev@paralogydev

# 2. Ir para o diretório
cd ~/Docker/repos/documentation

# 3. Identificar container
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

# 4. Corrigir permissões
docker exec -u root ${CONTAINER_ID} chown -R nextjs:nodejs /app/data
docker exec -u root ${CONTAINER_ID} chmod 775 /app/data
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db

# 5. Reiniciar
docker restart ${CONTAINER_ID}
```

## 📝 Resumo dos Scripts

| Script | Onde Executar | Quando Usar |
|--------|---------------|-------------|
| `scripts/fix-db-permissions.sh` | **Servidor Ubuntu** (via SSH) | Quando não consegue inserir/atualizar dados |
| `scripts/restore-db.sh` | **Servidor Ubuntu** (via SSH) | Quando precisa restaurar um backup |
| `scripts/backup-db.sh` | **Servidor Ubuntu** (via SSH) | Quando precisa fazer backup do banco |

## ❌ O que NÃO fazer

- ❌ **NÃO** executar scripts `.sh` na sua máquina Windows
- ❌ **NÃO** os scripts rodam automaticamente no pipeline/workflow
- ❌ **NÃO** precisa commitar os scripts para funcionar (são apenas ferramentas)

## ✅ O que fazer

- ✅ Conectar no servidor via SSH
- ✅ Executar os scripts no servidor
- ✅ Ou executar os comandos manualmente no servidor

## 🔄 Fluxo Completo de Restauração

```bash
# 1. Na sua máquina Windows - Conectar no servidor
ssh desenvol_dev@paralogydev

# 2. No servidor Ubuntu - Ir para o diretório
cd ~/Docker/repos/documentation

# 3. No servidor Ubuntu - Restaurar backup
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)
docker cp backups/documentation-EMERGENCY-20251117-204912.db ${CONTAINER_ID}:/app/data/documentation.db

# 4. No servidor Ubuntu - Corrigir permissões
docker exec -u root ${CONTAINER_ID} chown -R nextjs:nodejs /app/data
docker exec -u root ${CONTAINER_ID} chmod 775 /app/data
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db

# 5. No servidor Ubuntu - Reiniciar
docker restart ${CONTAINER_ID}

# 6. No servidor Ubuntu - Verificar logs
docker logs -f ${CONTAINER_ID}
```

## 💡 Dica

Se você usa **VS Code** com extensão **Remote SSH**, pode abrir o diretório do servidor diretamente e executar os scripts de lá!

