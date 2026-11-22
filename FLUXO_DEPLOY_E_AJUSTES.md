# 🔄 Fluxo de Deploy e Ajustes do Banco

## 📦 Como Funciona o Deploy

### 1. Pipeline/Workflow (`.github/workflows/dev.yml`)

```
1. Você faz commit e push para branch `develop`
   ↓
2. GitHub Actions roda:
   - Build da imagem Docker (inclui TODOS os arquivos do repo, incluindo scripts)
   - Push para ghcr.io/agroplay-music-ltda/documentation:dev
   ↓
3. No servidor self-hosted:
   - Faz pull da nova imagem
   - Para containers antigos
   - Sobe novo container com docker-compose
```

### 2. O que Vai para a Imagem Docker?

O `Dockerfile` linha 44 copia os scripts:
```dockerfile
COPY --from=builder /app/scripts ./scripts
```

**✅ Os scripts JÁ estão dentro da imagem Docker!**

### 3. O que Acontece no Container?

- **Código da aplicação**: ✅ Atualizado (nova imagem)
- **Scripts**: ✅ Estão lá (dentro da imagem)
- **Banco de dados**: ✅ Persiste no volume `docuhub-data` (não é substituído)
- **Migrações**: ✅ Rodam automaticamente quando o app inicia (via `lib/db.ts`)

## 🔧 Ajustes do Banco Após Deploy

### ⚠️ IMPORTANTE

Os scripts **NÃO rodam automaticamente** no workflow. Eles são ferramentas manuais para:
- Restaurar backup
- Corrigir permissões
- Fazer backup

### Como Acessar os Scripts no Container

Os scripts estão dentro do container em `/app/scripts/`:

```bash
# 1. Conectar no servidor
ssh desenvol_dev@paralogydev

# 2. Entrar no container
docker exec -it docuhub sh

# 3. Ver scripts disponíveis
ls -la /app/scripts/

# Você verá:
# - backup-db.sh
# - restore-db.sh
# - fix-db-permissions.sh
# - init-db.js
```

### Opção 1: Executar Scripts Dentro do Container

```bash
# No servidor Ubuntu
docker exec -it docuhub sh

# Dentro do container
cd /app/scripts
chmod +x fix-db-permissions.sh
./fix-db-permissions.sh
```

### Opção 2: Executar Comandos do Host (Recomendado)

```bash
# No servidor Ubuntu (fora do container)
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

# Corrigir permissões
docker exec -u root ${CONTAINER_ID} chown -R nextjs:nodejs /app/data
docker exec -u root ${CONTAINER_ID} chmod 775 /app/data
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db

# Reiniciar
docker restart ${CONTAINER_ID}
```

## 📋 Fluxo Completo: Deploy + Ajustes

### Passo 1: Deploy Automático (via Pipeline)

```bash
# Na sua máquina Windows
git add .
git commit -m "feat: remover categorias"
git push origin develop
```

O workflow faz tudo automaticamente:
- ✅ Build da imagem
- ✅ Push para GHCR
- ✅ Deploy no servidor
- ✅ Container sobe com nova versão

### Passo 2: Ajustes Manuais (se necessário)

**A) Se precisa restaurar backup:**

```bash
# No servidor Ubuntu
ssh desenvol_dev@paralogydev
cd ~/Docker/repos/documentation

CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

# Restaurar
docker cp backups/documentation-EMERGENCY-20251117-204912.db ${CONTAINER_ID}:/app/data/documentation.db

# Corrigir permissões
docker exec -u root ${CONTAINER_ID} chown -R nextjs:nodejs /app/data
docker exec -u root ${CONTAINER_ID} chmod 775 /app/data
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db

# Reiniciar
docker restart ${CONTAINER_ID}
```

**B) Se não consegue inserir/atualizar (problema de permissão):**

```bash
# No servidor Ubuntu
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

docker exec -u root ${CONTAINER_ID} chown -R nextjs:nodejs /app/data
docker exec -u root ${CONTAINER_ID} chmod 775 /app/data
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db
docker restart ${CONTAINER_ID}
```

**C) Migrações rodam automaticamente:**

Quando o container inicia, o `lib/db.ts` verifica e executa migrações automaticamente:
- ✅ Adiciona coluna `project_id` se não existir
- ✅ Remove FK de `category_id` (preservando dados)
- ✅ Remove tabela `categories` (preservando dados)

**Você não precisa fazer nada!** As migrações rodam sozinhas.

## 🎯 Resumo

| Item | Onde Está | Quando Atualiza |
|------|-----------|----------------|
| **Código da aplicação** | Dentro da imagem Docker | A cada deploy (automático) |
| **Scripts** | Dentro da imagem Docker (`/app/scripts/`) | A cada deploy (automático) |
| **Banco de dados** | Volume Docker (`docuhub-data`) | **NUNCA** (persistente) |
| **Migrações** | Código (`lib/db.ts`) | Automaticamente na inicialização |
| **Ajustes manuais** | Scripts no container | **Manual** (quando necessário) |

## ⚠️ Importante

1. **Banco NUNCA é substituído** - está no volume persistente (`docuhub-data`)
2. **Workflow NÃO remove volumes** - usa `docker compose down` (sem `-v`)
3. **Migrações rodam automaticamente** - não precisa fazer nada
4. **Scripts estão na imagem** - mas são executados manualmente quando necessário
5. **Permissões podem precisar correção** - após restaurar backup

## 🔍 Verificar se Tudo Funcionou

```bash
# No servidor Ubuntu
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

# Ver logs (deve mostrar migrações)
docker logs ${CONTAINER_ID} | grep -i "migração\|migration"

# Verificar permissões
docker exec ${CONTAINER_ID} ls -lh /app/data/documentation.db

# Testar criar um documento via admin
# Se funcionar, está tudo OK!
```

