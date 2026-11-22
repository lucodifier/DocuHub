# 🚀 Guia de Deploy - DocuHub

Este guia mostra como fazer deploy do DocuHub em diferentes ambientes.

## 📋 Índice

- [Docker (Recomendado)](#docker-recomendado)
- [VPS (Ubuntu/Debian)](#vps-ubuntudebian)
- [AWS / Azure / GCP](#cloud-providers)
- [Vercel (Não Recomendado)](#vercel-não-recomendado)

---

## 🐳 Docker (Recomendado)

### Pré-requisitos

- Docker 20.x ou superior
- Docker Compose 1.29 ou superior

### Passo a Passo

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/docuhub.git
cd docuhub
```

2. **Configure (opcional)**

Edite `docker-compose.yml` se necessário:

```yaml
ports:
  - "3000:3000"  # Mude para outra porta se necessário
```

3. **Build e Start**

```bash
docker-compose up -d --build
```

4. **Verificar logs**

```bash
docker-compose logs -f
```

5. **Acessar**

Abra `http://seu-servidor:3000`

### Comandos Úteis

```bash
# Ver status
docker-compose ps

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f

# Backup do banco
docker cp docuhub:/app/data/documentation.db ./backup.db

# Restore do banco
docker cp ./backup.db docuhub:/app/data/documentation.db
docker-compose restart
```

### Configuração com Nginx (Recomendado)

Crie `/etc/nginx/sites-available/docuhub`:

```nginx
server {
    listen 80;
    server_name docs.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative:

```bash
sudo ln -s /etc/nginx/sites-available/docuhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d docs.seudominio.com
```

---

## 🖥️ VPS (Ubuntu/Debian)

### Pré-requisitos

- Ubuntu 20.04+ ou Debian 11+
- Node.js 18+ instalado
- PM2 (para gerenciar processo)

### 1. Instalar Node.js

```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

### 2. Instalar PM2

```bash
sudo npm install -g pm2
```

### 3. Clonar e Configurar

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/docuhub.git
cd docuhub

# Instalar dependências
sudo npm install

# Inicializar banco
sudo npm run db:setup

# Build
sudo npm run build
```

### 4. Iniciar com PM2

```bash
pm2 start npm --name "docuhub" -- start
pm2 save
pm2 startup
```

### 5. Nginx como Reverse Proxy

Mesmo processo do Docker acima.

### Comandos PM2 Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs docuhub

# Reiniciar
pm2 restart docuhub

# Parar
pm2 stop docuhub

# Remover
pm2 delete docuhub
```

---

## ☁️ Cloud Providers

### AWS EC2

1. **Criar EC2 Instance** (Ubuntu 20.04)
2. **Configurar Security Group** (porta 80, 443, 3000)
3. **SSH e instalar Docker**:

```bash
ssh -i sua-chave.pem ubuntu@ec2-ip

# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

4. **Deploy**:

```bash
git clone https://github.com/seu-usuario/docuhub.git
cd docuhub
docker-compose up -d
```

### Azure VM

Similar ao AWS EC2, mas use:

```bash
# Criar VM
az vm create \
  --resource-group myResourceGroup \
  --name docuhub-vm \
  --image UbuntuLTS \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys
```

Depois, SSH e instale Docker.

### Google Cloud Platform

```bash
# Criar VM
gcloud compute instances create docuhub-vm \
  --machine-type=e2-small \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB
```

SSH e instale Docker.

---

## ⚠️ Vercel (Não Recomendado)

**PROBLEMA**: Vercel é serverless e não suporta SQLite (não há filesystem persistente).

### Alternativas para Vercel:

1. **Use Postgres** em vez de SQLite:
   - Adapte `lib/db.ts` para usar Postgres
   - Use Vercel Postgres ou Supabase

2. **Use outra plataforma**:
   - Railway
   - Render
   - Fly.io
   - DigitalOcean App Platform

### Railway (Recomendado como alternativa)

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] **Firewall** configurado (apenas portas 80, 443, 22)
- [ ] **SSL/TLS** ativo (Let's Encrypt)
- [ ] **Backup** automático do banco
- [ ] **Atualizações** do SO em dia
- [ ] **Docker** atualizado
- [ ] **Senha forte** no servidor
- [ ] **SSH key-based** auth (desabilitar senha)

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Backup Automático

Crie `/root/backup-docuhub.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup do banco
docker cp docuhub:/app/data/documentation.db $BACKUP_DIR/docs_$DATE.db

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "docs_*.db" -mtime +7 -delete

echo "Backup completed: docs_$DATE.db"
```

Adicione ao cron:

```bash
sudo chmod +x /root/backup-docuhub.sh
sudo crontab -e

# Adicione (backup diário às 3h)
0 3 * * * /root/backup-docuhub.sh
```

---

## 📊 Monitoramento

### Docker Stats

```bash
docker stats docuhub
```

### PM2 Monitor

```bash
pm2 monit
```

### Logs

```bash
# Docker
docker-compose logs -f --tail=100

# PM2
pm2 logs docuhub --lines 100
```

---

## 🔄 Atualização

### Com Docker

```bash
cd docuhub
git pull
docker-compose down
docker-compose up -d --build
```

### Com PM2

```bash
cd /var/www/docuhub
git pull
npm install
npm run build
pm2 restart docuhub
```

---

## ❓ Troubleshooting

### Container não inicia

```bash
docker-compose logs
```

### Banco de dados não persiste

Verifique volume no `docker-compose.yml`:

```yaml
volumes:
  - ./data:/app/data  # ESSENCIAL
```

### Porta 3000 em uso

```bash
sudo lsof -i :3000
# Ou mude a porta no docker-compose.yml
```

### Sem espaço em disco

```bash
# Limpar imagens antigas
docker system prune -a

# Ver uso
df -h
```

---

## 📞 Suporte

- GitHub Issues: [link]
- Documentação: README.md
- Quick Start: QUICK_START.md

---

**Boa sorte com o deploy!** 🚀

