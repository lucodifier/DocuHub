# 🔄 Como Restaurar o Banco de Dados no Servidor

## ⚠️ IMPORTANTE: Onde Executar?

**Todos os comandos abaixo devem ser executados no servidor Ubuntu**, não na sua máquina Windows.

1. Conecte no servidor: `ssh desenvol_dev@paralogydev`
2. Execute os comandos no servidor
3. Os scripts `.sh` são para Linux/Unix, não Windows

📖 **Veja `COMO_EXECUTAR_SCRIPTS.md` para mais detalhes.**

## 📦 Restaurar Backup no Container Docker (Servidor Ubuntu)

### Passo 1: Conectar no Servidor

```bash
ssh desenvol_dev@paralogydev
# ou o comando que você usa para acessar o servidor
```

### Passo 2: Identificar o Container

```bash
# Ver containers rodando
docker ps

# Exemplo de saída:
# CONTAINER ID   IMAGE                                                    STATUS
# 7e8b93e01aa5   ghcr.io/agroplay-music-ltda/documentation:dev   Up 2 hours

# OU buscar especificamente por imagem
docker ps --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev"
```

**💡 Nota:** Após fazer deploy da nova versão, o container terá um novo ID, mas o script detecta automaticamente. Se usar o script `restore-db.sh`, ele encontra o container sozinho.

### Passo 3: Copiar o Backup para o Servidor (se ainda não estiver lá)

Se o backup está na sua máquina local:

```bash
# Na sua máquina local (Windows)
scp backups/documentation-20251115-142659.db desenvol_dev@paralogydev:~/Docker/repos/documentation/backups/
```

### Passo 4: Restaurar o Backup no Container

**Opção 1: Usar o script (recomendado - detecta container automaticamente)**

```bash
# No servidor Ubuntu
cd ~/Docker/repos/documentation

# O script detecta o container automaticamente (mesmo após deploy com novo ID)
./scripts/restore-db.sh backups/documentation-EMERGENCY-20251117-204912.db
```

**Opção 2: Manualmente**

```bash
# No servidor Ubuntu
cd ~/Docker/repos/documentation

# Detectar container automaticamente (funciona mesmo após deploy)
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

# OU usar o nome do container (se configurado no docker-compose)
CONTAINER_NAME="docuhub"

# ⚠️ IMPORTANTE: docker cp COPIA o arquivo (não move/apaga o original)
# Copiar backup para dentro do container
docker cp backups/documentation-EMERGENCY-20251117-204912.db ${CONTAINER_ID}:/app/data/documentation.db

# OU se usar nome:
# docker cp backups/documentation-EMERGENCY-20251117-204912.db ${CONTAINER_NAME}:/app/data/documentation.db

# 🔧 CORRIGIR PERMISSÕES (OBRIGATÓRIO - permite escrita no banco)
docker exec -u root ${CONTAINER_ID} chown nextjs:nodejs /app/data/documentation.db
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db

# OU se usar nome:
# docker exec -u root ${CONTAINER_NAME} chown nextjs:nodejs /app/data/documentation.db
# docker exec -u root ${CONTAINER_NAME} chmod 664 /app/data/documentation.db
```

**⚠️ IMPORTANTE:** 
- O comando `docker cp` **COPIA** o arquivo, não move. O backup original permanece intacto na pasta `backups/`.
- Após deploy, o container terá novo ID, mas o script detecta automaticamente pela imagem.
- **SEMPRE corrija as permissões após restaurar**, senão não conseguirá criar/editar dados (erro de permissão).

### Passo 5: Reiniciar o Container

```bash
# Reiniciar para aplicar
docker restart ${CONTAINER_ID}

# Verificar logs para confirmar que iniciou corretamente
docker logs -f ${CONTAINER_ID}
```

### Passo 6: Verificar se Funcionou

```bash
# Verificar se o arquivo foi copiado
docker exec ${CONTAINER_ID} ls -lh /app/data/documentation.db

# Ver logs para ver se a migração rodou (sem apagar dados)
docker logs ${CONTAINER_ID} | grep -i "migração\|migration"
```

## ⚠️ IMPORTANTE - Garantias

O sistema **NÃO** vai recriar o banco porque:

1. ✅ **Dockerfile** não copia `data/documentation.db`
2. ✅ **lib/db.ts** só cria tabelas se o banco **não existir** ou estiver **vazio**
3. ✅ **Migrações** preservam todos os dados (só ajustam estrutura)
4. ✅ **init-db.js** só roda manualmente via `npm run db:setup` (não é chamado automaticamente)

## 🔧 Corrigir Permissões (Se não conseguir inserir/atualizar)

Se você consegue **listar** dados mas **não consegue inserir/atualizar**, é problema de permissão:

```bash
# Opção 1: Usar o script (recomendado)
cd ~/Docker/repos/documentation
./scripts/fix-db-permissions.sh

# Opção 2: Manualmente
CONTAINER_ID=$(docker ps -q --filter "ancestor=ghcr.io/agroplay-music-ltda/documentation:dev" | head -n 1)

# Corrigir diretório e arquivo
docker exec -u root ${CONTAINER_ID} chown -R nextjs:nodejs /app/data
docker exec -u root ${CONTAINER_ID} chmod 775 /app/data
docker exec -u root ${CONTAINER_ID} chmod 664 /app/data/documentation.db

# Reiniciar container
docker restart ${CONTAINER_ID}
```

## 🔍 Comandos Úteis

```bash
# Ver status do container
docker ps | grep documentation

# Ver logs em tempo real
docker logs -f docuhub

# Entrar no container (se precisar debugar)
docker exec -it docuhub sh

# Ver tamanho do banco
docker exec docuhub ls -lh /app/data/documentation.db

# Fazer novo backup antes de restaurar (segurança)
docker cp docuhub:/app/data/documentation.db backups/documentation-backup-antes-restore-$(date +%Y%m%d-%H%M%S).db
```

## 📝 Exemplo Completo (Com seu arquivo específico)

```bash
# 1. Ir para o diretório
cd ~/Docker/repos/documentation

# 2. Fazer backup de segurança do banco atual (opcional, mas recomendado)
docker cp docuhub:/app/data/documentation.db backups/documentation-backup-$(date +%Y%m%d-%H%M%S).db

# 3. Restaurar o backup EMERGENCY (arquivo original será preservado)
docker cp backups/documentation-EMERGENCY-20251117-204912.db docuhub:/app/data/documentation.db

# 4. Corrigir permissões (IMPORTANTE - permite escrita no banco)
docker exec -u root docuhub chown nextjs:nodejs /app/data/documentation.db
docker exec -u root docuhub chmod 664 /app/data/documentation.db

# 5. Reiniciar o container (a migração vai rodar automaticamente)
docker restart docuhub

# 5. Verificar logs para confirmar migração
docker logs -f docuhub
```

**⚠️ IMPORTANTE:**
- O comando `docker cp` **COPIA** o arquivo, não move. O backup `documentation-EMERGENCY-20251117-204912.db` permanece intacto em `backups/`.
- A migração vai rodar automaticamente quando o container reiniciar.
- Todos os documentos serão preservados durante a migração.
