# 🚀 Quick Start - DocuHub

## Início Rápido em 3 Passos

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Inicializar Banco de Dados

```bash
npm run db:setup
```

Isso cria o arquivo `data/documentation.db` com dados de exemplo.

### 3️⃣ Rodar o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

Acesse: `http://localhost:3000` 🎉

### 🔐 Acessar Área Admin

```
URL: http://localhost:3000/admin
Email: admin@docuhub.com
Senha: admin123
```

**Primeiro login?** Veja o `ADMIN_GUIDE.md` para tutorial completo!

---

## 🐳 Com Docker (Mais Simples)

### Um Comando Apenas:

```bash
docker-compose up -d
```

Pronto! Acesse `http://localhost:3000`

### Comandos Úteis:

```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Rebuild
docker-compose up -d --build
```

---

## 📝 Adicionar Novo Documento

### 🎯 Via Interface Admin (Recomendado)

1. Acesse `http://localhost:3000/admin`
2. Login: `admin@docuhub.com` / `admin123`
3. Vá em **Documents** > **New Document**
4. Preencha:
   - **Title**: Nome do documento
   - **Slug**: URL (auto-gerado)
   - **Category**: Escolha a seção
   - **Content**: Escreva em Markdown
5. Use **Preview** para ver antes de salvar
6. Clique em **Create Document**
7. ✨ Pronto! Já está no site público

📖 **Guia detalhado**: `ADMIN_GUIDE.md`

### Via Node.js

```javascript
const db = require('better-sqlite3')('data/documentation.db');

db.prepare(`
  INSERT INTO documents (title, slug, category_id, content, order_index)
  VALUES (?, ?, ?, ?, ?)
`).run(
  'Meu Novo Doc',
  'meu-novo-doc',
  1,  // ID da categoria
  '# Título\n\nConteúdo em **Markdown** com emojis! 🚀',
  0
);
```

### Via API

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Documento",
    "slug": "meu-documento",
    "categoryId": 1,
    "content": "# Olá\n\nConteúdo aqui! 🎉",
    "orderIndex": 0
  }'
```

---

## ✅ Checklist de Deploy

- [ ] **Alterou credenciais padrão do admin?** ⚠️ CRÍTICO
- [ ] Ajustou as cores no `tailwind.config.js`?
- [ ] Personalizou o logo no `components/Sidebar.tsx`?
- [ ] Configurou volumes no `docker-compose.yml`?
- [ ] Configurou `JWT_SECRET` em produção?
- [ ] Ativou HTTPS para área admin?
- [ ] Fez backup do `data/documentation.db`?
- [ ] Testou localmente com `npm run dev`?
- [ ] Testou com Docker antes do deploy?
- [ ] Testou login na área admin?

---

## 🆘 Problemas?

### Erro ao instalar better-sqlite3

```bash
npm install better-sqlite3 --build-from-source
```

### Banco não persiste no Docker

Verifique se tem o volume:
```yaml
volumes:
  - ./data:/app/data  # ← Isso é ESSENCIAL!
```

### Porta 3000 em uso

Mude no `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Usa porta 8080
```

---

## 📚 Próximos Passos

1. 🔐 **Acesse o Admin**: `http://localhost:3000/admin`
2. 📖 **Leia o Guia Admin**: `ADMIN_GUIDE.md` (tutorial completo)
3. ✏️ **Crie suas categorias** e documentos pela interface
4. 🎨 **Customize**: cores, logo, design
5. 📚 **Leia o README**: `README.md` completo
6. 🚀 **Deploy**: consulte `DEPLOY.md`

### 🎓 Recursos Disponíveis

- `README.md` - Documentação técnica completa
- `ADMIN_GUIDE.md` - Como usar a área administrativa
- `DEPLOY.md` - Guias de deploy
- `CONTRIBUTING.md` - Como contribuir
- `QUICK_START.md` - Este guia rápido

Boa sorte! 🎉

