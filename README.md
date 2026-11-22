# 📚 DocuHub

**Plataforma self-hosted de documentação técnica, organizada por empresa e projeto, com editor Markdown, diagramas Mermaid e painel administrativo.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

🌐 **Landing page:** https://lucodifier.github.io/DocuHub/

---

## 💡 Sobre o projeto

O DocuHub nasceu da necessidade de centralizar a documentação de vários projetos de diferentes clientes em um único lugar, simples de operar e barato de hospedar. Em vez de wikis pesadas, ele entrega um site de documentação leve onde:

- o conteúdo é escrito em **Markdown** (com tabelas, blocos de código com realce, emojis e diagramas **Mermaid**);
- a documentação é organizada na hierarquia **Empresa → Projeto → Documento**;
- visitantes navegam e buscam sem login, enquanto a edição fica atrás de uma **área administrativa autenticada**;
- tudo roda em **um único container**, com o banco SQLite embutido, backup e restore automatizados no deploy.

## ✨ Funcionalidades

**Leitura (área pública)**
- Sidebar larga com **filtro de busca**, agrupada por empresa e projeto
- Navegador de projetos com filtros por empresa/projeto e busca por documento
- Renderização de Markdown com syntax highlighting, tabelas, GFM e emojis
- **Diagramas Mermaid** renderizados direto dos blocos de código
- Dark mode, layout responsivo e página de contato
- Style guide interno (`/style-guide`) para padronizar a escrita

**Administração (`/admin`)**
- Login com **JWT + bcrypt**, cookie HTTP-only e proteção de rotas via middleware
- CRUD completo de **empresas, projetos e documentos**
- Editor Markdown com preview
- API REST protegida para automações

**Operação**
- `Dockerfile` e `docker-compose` prontos, com volume persistente
- Pipeline do GitHub Actions que publica a imagem no GHCR
- Scripts de **backup/restore** do SQLite e correção de permissões
- Banco fora do versionamento, com restauração automática no deploy

## 🧱 Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router) + React 18 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS + lucide-react |
| Dados | SQLite via `better-sqlite3` |
| Conteúdo | `react-markdown`, `remark-gfm`, `remark-emoji`, `rehype-highlight`, `rehype-raw`, Mermaid |
| Auth | `jsonwebtoken` + `bcryptjs` |
| Infra | Docker, Docker Compose, GitHub Actions |

## 🗂️ Modelo de dados

```
companies 1 ──< projects 1 ──< documents
users (administradores)
```

- **companies**: `name`, `description`
- **projects**: `company_id`, `name`, `slug`, `description`, `order_index`
- **documents**: `title`, `slug`, `project_id`, `content` (Markdown), `order_index`, `created_at`, `updated_at`
- **users**: `email`, `password` (hash bcrypt), `name`

## 🚀 Como rodar

### Local

Requisitos: Node.js 18+.

```bash
npm install
npm run db:setup   # cria o banco com dados de exemplo
npm run dev
```

Acesse `http://localhost:3000`. O painel fica em `http://localhost:3000/admin`.

> ⚠️ O `db:setup` cria um usuário de exemplo (`admin@docuhub.com` / `admin123`). **Troque a senha antes de qualquer uso real.**

### Docker

```bash
docker-compose up -d
```

O volume `docuhub-data` mantém o SQLite entre reinícios. Veja [RESTORE_DB.md](RESTORE_DB.md) para backup e restauração.

## 📁 Estrutura

```
app/
├── admin/            # painel (empresas, projetos, documentos)
├── api/              # rotas REST públicas e protegidas
├── docs/[slug]/      # páginas de documentação
├── login/ contact/ style-guide/
components/           # Sidebar, ProjectBrowser, MarkdownRenderer, MermaidBlock...
lib/                  # db (SQLite), auth (JWT), middleware
scripts/              # init-db, backup-db, restore-db
guides/               # guias de admin, deploy e funcionalidades
site/                 # landing page do projeto (GitHub Pages)
```

## 📖 Documentação adicional

- [Guia do administrador](guides/ADMIN_GUIDE.md)
- [Deploy](guides/DEPLOY.md)
- [Lista de funcionalidades](guides/FEATURES.md)
- [Fluxo de deploy e ajustes](FLUXO_DEPLOY_E_AJUSTES.md)
- [Restore do banco](RESTORE_DB.md)
- [Quick start](QUICK_START.md)

## 📄 Licença

MIT. Veja [LICENSE](LICENSE).
