# 🔐 Guia da Área Administrativa - DocuHub

Este guia explica como usar a área administrativa do DocuHub para gerenciar sua documentação.

## 📋 Índice

- [Primeiro Acesso](#primeiro-acesso)
- [Dashboard](#dashboard)
- [Gerenciamento de Documentos](#gerenciamento-de-documentos)
- [Gerenciamento de Categorias](#gerenciamento-de-categorias)
- [Dicas e Boas Práticas](#dicas-e-boas-práticas)

---

## 🚪 Primeiro Acesso

### Credenciais Padrão

Após inicializar o banco de dados, você pode fazer login com:

- **Email**: `admin@docuhub.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere essas credenciais em produção!

### URL de Acesso

```
http://localhost:3000/admin
```

Se não estiver logado, você será redirecionado para `/login`.

---

## 📊 Dashboard

O dashboard é a página inicial da área admin e mostra:

### Estatísticas
- **Total de Documentos**: Quantidade total de páginas criadas
- **Total de Categorias**: Quantidade de seções/menus

### Ações Rápidas
- Criar Novo Documento
- Criar Nova Categoria
- Ver Site Público

### Informações do Sistema
- Tipo de banco de dados (SQLite)
- Framework utilizado (Next.js 14)
- Sistema de estilização (Tailwind CSS)

---

## 📝 Gerenciamento de Documentos

### Listar Documentos

Em **Documents** você vê todos os documentos com:
- Título
- Categoria
- Slug (URL)
- Data da última atualização
- Ações (Ver, Editar, Deletar)

### Criar Novo Documento

1. Clique em **"New Document"**
2. Preencha os campos:

#### Campos Obrigatórios

**Title** (Título)
- Nome do documento que aparece no menu
- Exemplo: "Welcome to DocuHub"

**Slug**
- URL amigável (auto-gerada do título)
- Apenas letras minúsculas, números e hífens
- Exemplo: `welcome-to-docuhub`
- URL final: `/docs/welcome-to-docuhub`

**Category** (Categoria)
- Selecione em qual seção o documento aparece
- Se não houver categorias, crie uma primeiro

**Content** (Conteúdo)
- Escreva em Markdown
- Suporta emojis nativamente 🚀
- Suporta code blocks com syntax highlighting

#### Campos Opcionais

**Order Index**
- Ordem de exibição dentro da categoria
- Menor número = aparece primeiro
- Padrão: 0

### Editar Documento

1. Na lista, clique no ícone de **Editar** (✏️)
2. Modifique os campos desejados
3. Use o botão **"Preview"** para ver como ficará
4. Clique em **"Save Changes"**

### Deletar Documento

1. Na lista, clique no ícone de **Deletar** (🗑️)
2. Confirme a exclusão
3. O documento será removido permanentemente

⚠️ **Atenção**: Essa ação não pode ser desfeita!

---

## 📁 Gerenciamento de Categorias

### O que são Categorias?

Categorias são as seções do menu lateral, como:
- I. GETTING STARTED
- II. USER SETTINGS
- III. ADVANCED USAGE

### Listar Categorias

Em **Categories** você vê:
- Nome da categoria
- Ordem de exibição
- Ações (Editar, Deletar)

### Criar Nova Categoria

1. Clique em **"New Category"**
2. Preencha:
   - **Name**: Nome da categoria (ex: "I. GETTING STARTED")
   - **Order**: Ordem de exibição (0 = primeiro)
3. Clique em **"Save"**

### Editar Categoria

1. Clique no ícone de **Editar** (✏️)
2. Os campos ficam editáveis
3. Faça as alterações
4. Clique no ícone **"Save"** (💾)

### Deletar Categoria

⚠️ **ATENÇÃO**: Deletar uma categoria remove **TODOS** os documentos dentro dela!

1. Clique no ícone de **Deletar** (🗑️)
2. Confirme a exclusão
3. A categoria e todos seus documentos serão removidos

---

## 📝 Escrevendo Markdown

### Sintaxe Básica

```markdown
# Título Principal (H1)
## Seção (H2)
### Subseção (H3)

**Texto em negrito**
*Texto em itálico*

- Lista não ordenada
- Item 2
- Item 3

1. Lista ordenada
2. Item 2
3. Item 3

[Link](https://exemplo.com)

`código inline`
```

### Code Blocks

````markdown
```javascript
const hello = () => {
  console.log('Hello World! 🌍');
};
```
````

### Emojis

Apenas digite o emoji diretamente:
```markdown
🚀 🎉 💻 📚 ✅ ❌ ⚠️ 💡 🔥
```

### Citações

```markdown
> Esta é uma citação
> Pode ter múltiplas linhas
```

### Tabelas

```markdown
| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dado 1   | Dado 2   | Dado 3   |
| Dado 4   | Dado 5   | Dado 6   |
```

---

## 💡 Dicas e Boas Práticas

### Organização

1. **Use categorias lógicas**
   - Agrupe documentos relacionados
   - Mantenha hierarquia clara (I, II, III...)

2. **Slugs descritivos**
   - Use nomes que descrevem o conteúdo
   - Evite slugs genéricos como "doc1", "page2"
   - Bom: `installing-docuhub`
   - Ruim: `doc1`

3. **Order Index**
   - Use múltiplos de 10 (0, 10, 20, 30...)
   - Facilita inserir documentos entre outros depois

### Conteúdo

1. **Estruture bem**
   - Use hierarquia de títulos (H1, H2, H3)
   - Divida em seções lógicas
   - Adicione índice no início se muito longo

2. **Seja visual**
   - Use emojis para destacar pontos importantes
   - Adicione exemplos de código
   - Use listas para facilitar leitura

3. **Mantenha atualizado**
   - Revise documentos periodicamente
   - Atualize informações desatualizadas
   - Delete documentos obsoletos

### Workflow Recomendado

1. **Planeje a estrutura**
   ```
   I. Getting Started
      - Welcome
      - Installation
      - Quick Start
   
   II. User Guide
      - Basic Usage
      - Advanced Features
   ```

2. **Crie categorias primeiro**
   - Defina todas as seções
   - Configure a ordem

3. **Adicione documentos**
   - Comece pelos mais importantes
   - Use preview antes de salvar
   - Revise no site público

4. **Mantenha consistência**
   - Use mesmo estilo de títulos
   - Mantenha formatação similar
   - Use emojis de forma consistente

---

## 🔒 Segurança

### Alterando Senha do Admin

Atualmente, a senha está no banco. Para alterar:

```javascript
// Usar via Node.js
const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('data/documentation.db');

const newPassword = 'sua-nova-senha-segura';
const hashedPassword = bcrypt.hashSync(newPassword, 10);

db.prepare('UPDATE users SET password = ? WHERE email = ?').run(
  hashedPassword,
  'admin@docuhub.com'
);

console.log('Senha atualizada!');
```

### Criando Novos Usuários

```javascript
const bcrypt = require('bcryptjs');
const db = require('better-sqlite3')('data/documentation.db');

const email = 'novo@usuario.com';
const password = 'senha-segura';
const name = 'Nome do Usuário';

const hashedPassword = bcrypt.hashSync(password, 10);

db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(
  email,
  hashedPassword,
  name
);

console.log('Usuário criado!');
```

### Boas Práticas de Segurança

- ✅ Use senhas fortes (mínimo 12 caracteres)
- ✅ Ative HTTPS em produção
- ✅ Configure firewall adequadamente
- ✅ Faça backups regulares do banco
- ✅ Mantenha o sistema atualizado
- ❌ Nunca compartilhe credenciais
- ❌ Não use credenciais padrão em produção

---

## 🔄 Fluxo de Atualização

### Como Mudanças Aparecem no Site

1. **Criar/Editar no Admin** → Salva no banco SQLite
2. **Banco Atualizado** → Dados disponíveis imediatamente
3. **Site Público** → Lê dados atualizados do banco
4. **Usuários veem** → Conteúdo novo em tempo real

**Não é necessário rebuild ou restart!** ✨

As mudanças são refletidas instantaneamente porque:
- Next.js usa `dynamic = 'force-dynamic'`
- SQLite é consultado a cada request
- Não há cache de dados

---

## 🆘 Problemas Comuns

### "Unauthorized" ao acessar /admin

**Causa**: Token expirado ou inválido

**Solução**:
1. Faça logout
2. Faça login novamente
3. Se persistir, limpe cookies do navegador

### Slug já existe

**Causa**: Tentando criar documento com slug duplicado

**Solução**:
1. Escolha outro slug único
2. Ou edite/delete o documento existente

### Categoria não aparece

**Causa**: Order index incorreto ou sem documentos

**Solução**:
1. Verifique o order_index
2. Certifique-se que há documentos na categoria
3. Recarregue a página

### Markdown não renderiza corretamente

**Solução**:
1. Verifique sintaxe do Markdown
2. Use preview antes de salvar
3. Consulte este guia para sintaxe correta

---

## 📞 Suporte

Para mais ajuda:
- Consulte o `README.md` principal
- Veja `QUICK_START.md` para setup inicial
- Abra uma issue no GitHub

---

**Happy Documenting!** 📚✨

