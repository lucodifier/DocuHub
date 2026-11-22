const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'documentation.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    project_id INTEGER,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
  CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
  CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
  CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
  CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

try {
  db.exec('ALTER TABLE documents ADD COLUMN project_id INTEGER');
} catch (error) {
  if (!String(error?.message).includes('duplicate column name')) {
    throw error;
  }
}

// Insert sample data
const categories = [
  { name: 'I. GETTING STARTED', order: 1 },
  { name: 'II. USER SETTINGS', order: 2 },
  { name: 'III. ADVANCED USAGE', order: 3 },
  { name: 'IV. WRITING POSTS AND PAGES', order: 4 },
  { name: 'V. WEBSITE CONFIGURATION', order: 5 },
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, order_index) VALUES (?, ?)');
categories.forEach(cat => insertCategory.run(cat.name, cat.order));

const companies = [
  {
    name: 'Agroplay',
    description: 'Plataforma Agroplay de documentação interna',
  },
];

const insertCompany = db.prepare('INSERT OR IGNORE INTO companies (name, description) VALUES (?, ?)');
companies.forEach(company => insertCompany.run(company.name, company.description));

const companyLookup = db.prepare('SELECT * FROM companies WHERE name = ?');
const defaultCompany = companyLookup.get('Agroplay');

const projects = [
  {
    companyId: defaultCompany?.id,
    name: 'DocuHub Core',
    slug: 'agroplay-docuhub',
    description: 'Documentação central dos produtos Agroplay',
    order: 1,
  },
];

const insertProject = db.prepare(
  'INSERT OR IGNORE INTO projects (company_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)'
);
projects.forEach(project => {
  if (project.companyId) {
    insertProject.run(project.companyId, project.name, project.slug, project.description, project.order);
  }
});

const projectLookup = db.prepare('SELECT * FROM projects WHERE slug = ?');
const defaultProject = projectLookup.get('agroplay-docuhub');

const sampleDocuments = [
  {
    title: 'Welcome to Ghost',
    slug: 'welcome-to-ghost',
    category: 'I. GETTING STARTED',
    order: 1,
    content: `# Welcome to Ghost! 👻

Ghost is a powerful app for new-media creators to publish, share, and grow a business around their content. It comes with modern tools to build a website, publish content, send newsletters & offer paid subscriptions to members.

## Getting Started

Everything you need to know to get started with Ghost. This guide will help you understand the basics and get your documentation site up and running.

### Key Features

- 📝 **Markdown Support** - Write content using markdown with full emoji support
- 🎨 **Beautiful Design** - Modern, clean interface built with Tailwind CSS
- 🚀 **Fast & Lightweight** - Built on Next.js for optimal performance
- 💾 **SQLite Database** - Simple, file-based database that's easy to backup
- 🐳 **Docker Ready** - Deploy anywhere with Docker support

## What's Next?

Check out the other sections to learn more about user settings, advanced usage, and how to write great documentation! ✨
`
  },
  {
    title: 'Writing posts with Ghost ✍️',
    slug: 'writing-posts',
    category: 'I. GETTING STARTED',
    order: 2,
    content: `# Writing Posts with Ghost ✍️

Ghost has a powerful visual editor with familiar formatting options, as well as the ability to add dynamic content.

## Markdown Support

You can write in markdown and it will be beautifully rendered:

\`\`\`javascript
const hello = () => {
  console.log('Hello World! 🌍');
};
\`\`\`

### Lists and Formatting

- ✅ Task lists
- 🔗 Links and references
- **Bold** and *italic* text
- \`Inline code\` and code blocks

> "The best documentation is the one that your users actually read." - Someone wise

## Adding Emojis

Emojis work perfectly! 🎉 🚀 💻 📚 ⚡

Just type them naturally and they'll render beautifully in your documentation.
`
  },
  {
    title: 'Publishing options',
    slug: 'publishing-options',
    category: 'I. GETTING STARTED',
    order: 3,
    content: `# Publishing Options 📤

Learn how to publish and manage your documentation effectively.

## Document Structure

Each document has:
1. **Title** - The main heading
2. **Slug** - URL-friendly identifier (e.g., "publishing-options")
3. **Category** - Organize by section
4. **Content** - Markdown content with emojis

## Best Practices

### Organizing Content
- Keep related docs in the same category
- Use clear, descriptive titles
- Create logical navigation paths

### Writing Tips
- Use headings to structure content
- Add code examples where helpful
- Include emojis to make it engaging 🎯
- Keep paragraphs concise

## URL Structure

Documents are accessible via their slug:
\`\`\`
/docs/[slug]
\`\`\`

Example: \`/docs/publishing-options\`
`
  },
  {
    title: 'Managing admin settings',
    slug: 'managing-admin',
    category: 'I. GETTING STARTED',
    order: 4,
    content: `# Managing Admin Settings ⚙️

Configure and customize your documentation site.

## Configuration Options

The site can be configured through environment variables and the database.

### Database Management

Your SQLite database stores:
- Categories (sections in the sidebar)
- Documents (individual pages)
- Metadata and timestamps

### Backup Your Data

Since SQLite is file-based, backing up is simple:

\`\`\`bash
# Backup the database
cp data/documentation.db data/backup.db

# Or use Docker volumes
docker cp container_name:/app/data/documentation.db ./backup.db
\`\`\`

## Adding New Content

You can add new documentation through:
1. Direct database operations
2. API routes (if you extend the app)
3. Admin interface (if you build one)

Stay organized and your docs will stay beautiful! 📚✨
`
  },
  {
    title: 'Settings pertaining to users',
    slug: 'user-settings',
    category: 'II. USER SETTINGS',
    order: 1,
    content: `# User Settings 👤

Configure user-related settings for your documentation site.

## User Experience

Focus on creating a great reading experience:

### Navigation
- Clear sidebar with categories
- Search functionality (can be added)
- Breadcrumbs for context

### Accessibility
- Proper heading hierarchy
- Good color contrast (dark theme)
- Keyboard navigation support

### Performance
- Fast page loads with Next.js
- Optimized markdown rendering
- Efficient SQLite queries

## Customization

You can customize:
- Color scheme (via Tailwind config)
- Typography and spacing
- Layout and components
- Additional features

Make it your own! 🎨
`
  },
  {
    title: 'Advanced topics for power users',
    slug: 'advanced-topics',
    category: 'III. ADVANCED USAGE',
    order: 1,
    content: `# Advanced Topics 🚀

Deep dive into advanced features and customization.

## Docker Deployment

Deploy your documentation with Docker:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

VOLUME /app/data

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

### Docker Compose

\`\`\`yaml
version: '3.8'
services:
  docuhub:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
\`\`\`

## Database Queries

Optimize your queries:

\`\`\`typescript
// Efficient category lookup with documents
const query = \`
  SELECT d.*, c.name as category_name
  FROM documents d
  JOIN categories c ON d.category_id = c.id
  WHERE d.slug = ?
\`;
\`\`\`

## Performance Optimization

- Use Static Site Generation (SSG) where possible
- Implement caching strategies
- Optimize images and assets
- Minimize bundle size

Happy optimizing! ⚡
`
  },
  {
    title: 'Writing posts and pages',
    slug: 'writing-posts-pages',
    category: 'IV. WRITING POSTS AND PAGES',
    order: 1,
    content: `# Writing Posts and Pages 📝

Master the art of writing great documentation.

## Markdown Guide

### Headers

\`\`\`markdown
# H1 - Main Title
## H2 - Section
### H3 - Subsection
#### H4 - Details
\`\`\`

### Formatting

- **Bold text** with \`**bold**\`
- *Italic text* with \`*italic*\`
- \`Inline code\` with backticks
- ~~Strikethrough~~ with \`~~text~~\`

### Code Blocks

\`\`\`python
def hello_world():
    print("Hello, World! 🌍")
\`\`\`

### Links and Images

- [Link text](https://example.com)
- ![Alt text](image-url.jpg)

## Writing Tips 💡

1. **Start with an outline** - Plan your structure
2. **Use examples** - Show, don't just tell
3. **Add emojis** - Make it engaging 🎉
4. **Keep it concise** - Respect your readers' time
5. **Test your code** - Ensure examples work

### Content Checklist

- ✅ Clear title
- ✅ Introduction paragraph
- ✅ Logical sections
- ✅ Code examples
- ✅ Helpful visuals
- ✅ Summary or next steps

Write documentation that you'd want to read! 📚
`
  }
];

const insertDoc = db.prepare(`
  INSERT OR IGNORE INTO documents (title, slug, category_id, project_id, content, order_index)
  SELECT ?, ?, c.id, ?, ?, ?
  FROM categories c
  WHERE c.name = ?
`);

sampleDocuments.forEach(doc => {
  insertDoc.run(
    doc.title,
    doc.slug,
    defaultProject ? defaultProject.id : null,
    doc.content,
    doc.order,
    doc.category
  );
});

// Create default admin user
const defaultEmail = 'admin@docuhub.com';
const defaultPassword = 'admin123';
const defaultName = 'Admin User';

const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(defaultEmail);

if (!existingUser) {
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
  db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(
    defaultEmail,
    hashedPassword,
    defaultName
  );
  console.log('✅ Default admin user created!');
  console.log('📧 Email:', defaultEmail);
  console.log('🔑 Password:', defaultPassword);
} else {
  console.log('ℹ️  Admin user already exists');
}

console.log('\n✅ Database initialized with sample data!');
console.log('📁 Database location:', dbPath);
console.log('\n🔐 Login credentials:');
console.log('   Email:', defaultEmail);
console.log('   Password:', defaultPassword);
console.log('\n🌐 Access admin panel at: http://localhost:3000/admin');

db.close();

