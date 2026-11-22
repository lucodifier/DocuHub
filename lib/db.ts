import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'documentation.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Verificar se o banco existe antes de conectar
const dbExists = fs.existsSync(dbPath);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Só criar tabelas se o banco for novo (não existe ou está vazio)
const tableExists = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='documents'
`).get();

// Create base tables apenas se o banco for novo
if (!tableExists) {
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

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER,
    project_id INTEGER,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
  CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
  CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
  CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);
}

// Sistema de migração - executa apenas o necessário sem apagar dados
if (tableExists) {
  // Migração 1: Adicionar coluna project_id se não existir
  try {
    const hasProjectId = db.prepare(`
      SELECT COUNT(*) as count 
      FROM pragma_table_info('documents') 
      WHERE name = 'project_id'
    `).get() as { count: number };
    
    if (hasProjectId.count === 0) {
      db.exec('ALTER TABLE documents ADD COLUMN project_id INTEGER');
      console.log('✅ Migração: Coluna project_id adicionada');
    }
  } catch (error: any) {
    if (!String(error?.message).includes('duplicate column name')) {
      console.warn('⚠️  Aviso na migração project_id:', error.message);
    }
  }

  // Migração 2: Remover FK de categorias e tabela categories (mantém dados)
  try {
    // Verificar se existe FK de category_id na tabela documents
    const tableInfo = db.prepare(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='documents'
    `).get() as { sql: string } | undefined;
    
    const hasCategoryFK = tableInfo?.sql.includes('FOREIGN KEY (category_id) REFERENCES categories');
    const categoriesTableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='categories'
    `).get();
    
    if (hasCategoryFK || categoriesTableExists) {
      // Desabilitar FKs temporariamente
      db.pragma('foreign_keys = OFF');
      
      // Se tem FK, precisamos recriar a tabela sem a FK (mantendo dados)
      if (hasCategoryFK) {
        console.log('🔄 Migração: Removendo FK de category_id...');
        
        // 1. Criar tabela temporária com a nova estrutura (sem FK de category_id)
        db.exec(`
          CREATE TABLE documents_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            category_id INTEGER,
            project_id INTEGER,
            content TEXT NOT NULL,
            order_index INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
          )
        `);
        
        // 2. Copiar todos os dados (mantendo category_id dos documentos existentes)
        db.exec(`
          INSERT INTO documents_new 
          (id, title, slug, category_id, project_id, content, order_index, created_at, updated_at)
          SELECT id, title, slug, category_id, project_id, content, order_index, created_at, updated_at
          FROM documents
        `);
        
        // 3. Remover tabela antiga
        db.exec('DROP TABLE documents');
        
        // 4. Renomear nova tabela
        db.exec('ALTER TABLE documents_new RENAME TO documents');
        
        // 5. Recriar índices
        db.exec('CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id)');
        
        console.log('✅ Migração: FK de category_id removida (dados preservados)');
      }
      
      // Remover tabela categories se existir (dados de documentos já estão seguros)
      if (categoriesTableExists) {
        console.log('🔄 Migração: Removendo tabela categories...');
        db.exec('DROP TABLE IF EXISTS categories');
        console.log('✅ Migração: Tabela categories removida');
      }
      
      // Reabilitar FKs
      db.pragma('foreign_keys = ON');
    }
  } catch (error: any) {
    console.warn('⚠️  Aviso na migração de categorias:', error.message);
    // Garantir que FKs estão reabilitadas mesmo em caso de erro
    db.pragma('foreign_keys = ON');
  }
}


export interface Company {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  company_id: number;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface ProjectWithCompany extends Project {
  company_name: string;
}

export interface Document {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  project_id: number | null;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentWithCategory extends Document {
  project_name: string | null;
  company_name: string | null;
  company_id: number | null;
}

export interface ProjectWithDocuments extends Project {
  documents: DocumentWithCategory[];
}

export interface CompanyWithProjectsAndDocuments extends Company {
  projects: ProjectWithDocuments[];
}

export interface SidebarProjectData {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  documents: SidebarDocumentData[];
}

export interface SidebarDocumentData {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

// Category operations removidas - categorias não são mais usadas

// Company operations
export const getCompanies = (): Company[] => {
  return db.prepare('SELECT * FROM companies ORDER BY name').all() as Company[];
};

export const getCompanyById = (id: number): Company | undefined => {
  return db.prepare('SELECT * FROM companies WHERE id = ?').get(id) as Company | undefined;
};

export const getCompaniesWithProjects = (): Array<Company & { projects: Project[] }> => {
  const companies = getCompanies();
  const projects = getProjects();

  return companies.map((company) => ({
    ...company,
    projects: projects.filter((project) => project.company_id === company.id),
  }));
};

export const createCompany = (name: string, description?: string): Company => {
  const stmt = db.prepare('INSERT INTO companies (name, description) VALUES (?, ?)');
  const info = stmt.run(name, description ?? null);
  return db.prepare('SELECT * FROM companies WHERE id = ?').get(info.lastInsertRowid) as Company;
};

export const updateCompany = (id: number, name: string, description?: string): void => {
  const stmt = db.prepare('UPDATE companies SET name = ?, description = ? WHERE id = ?');
  stmt.run(name, description ?? null, id);
};

export const deleteCompany = (id: number): void => {
  const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
  stmt.run(id);
};

// Project operations
export const getProjects = (): Project[] => {
  return db.prepare('SELECT * FROM projects ORDER BY order_index, name').all() as Project[];
};

export const getProjectById = (id: number): Project | undefined => {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
};

export const getProjectsByCompany = (companyId: number): Project[] => {
  return db
    .prepare('SELECT * FROM projects WHERE company_id = ? ORDER BY order_index, name')
    .all(companyId) as Project[];
};

export const getProjectsWithCompany = (): ProjectWithCompany[] => {
  return db
    .prepare(
      `
        SELECT p.*, co.name AS company_name
        FROM projects p
        JOIN companies co ON p.company_id = co.id
        ORDER BY co.name, p.order_index, p.name
      `
    )
    .all() as ProjectWithCompany[];
};

export const createProject = (
  companyId: number,
  name: string,
  slug: string,
  description?: string,
  orderIndex: number = 0
): Project => {
  const stmt = db.prepare(
    'INSERT INTO projects (company_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)'
  );
  const info = stmt.run(companyId, name, slug, description ?? null, orderIndex);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid) as Project;
};

export const updateProject = (
  id: number,
  companyId: number,
  name: string,
  slug: string,
  description: string | null,
  orderIndex: number
): void => {
  const stmt = db.prepare(
    `UPDATE projects SET company_id = ?, name = ?, slug = ?, description = ?, order_index = ? WHERE id = ?`
  );
  stmt.run(companyId, name, slug, description, orderIndex, id);
};

export const deleteProject = (id: number): void => {
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  stmt.run(id);
};

// Document operations
export const getAllDocuments = (): DocumentWithCategory[] => {
  return db
    .prepare(
      `
      SELECT 
        d.*,
        p.name AS project_name,
        co.name AS company_name,
        co.id AS company_id
      FROM documents d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN companies co ON p.company_id = co.id
      ORDER BY co.name, p.order_index, d.order_index, d.title
    `
    )
    .all() as DocumentWithCategory[];
};

export const getDocumentBySlug = (slug: string): DocumentWithCategory | undefined => {
  return db
    .prepare(
      `
      SELECT 
        d.*,
        p.name AS project_name,
        co.name AS company_name,
        co.id AS company_id
      FROM documents d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN companies co ON p.company_id = co.id
      WHERE d.slug = ?
    `
    )
    .get(slug) as DocumentWithCategory | undefined;
};

// getDocumentsByCategory removida - categorias não são mais usadas

export const getDocumentsByProject = (projectId: number): DocumentWithCategory[] => {
  return db
    .prepare(
      `
      SELECT 
        d.*,
        p.name AS project_name,
        co.name AS company_name,
        co.id AS company_id
      FROM documents d
      LEFT JOIN projects p ON d.project_id = p.id
      LEFT JOIN companies co ON p.company_id = co.id
      WHERE d.project_id = ?
      ORDER BY d.order_index, d.title
    `
    )
    .all(projectId) as DocumentWithCategory[];
};

export const createDocument = (
  title: string,
  slug: string,
  categoryId: number | null,
  projectId: number | null,
  content: string,
  orderIndex: number = 0
): Document => {
  // categoryId é opcional agora - pode ser null
  const finalCategoryId = categoryId ?? null;

  const stmt = db.prepare(
    `
      INSERT INTO documents (title, slug, category_id, project_id, content, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  );
  const info = stmt.run(title, slug, finalCategoryId, projectId, content, orderIndex);
  return db.prepare('SELECT * FROM documents WHERE id = ?').get(info.lastInsertRowid) as Document;
};

export const updateDocument = (
  id: number,
  title: string,
  slug: string,
  categoryId: number | null,
  projectId: number | null,
  content: string,
  orderIndex: number
): void => {
  // categoryId é opcional - se não fornecido, mantém o existente ou null
  let finalCategoryId = categoryId;
  if (finalCategoryId === null || finalCategoryId === undefined) {
    const currentDoc = db.prepare('SELECT category_id FROM documents WHERE id = ?').get(id) as { category_id: number | null } | undefined;
    finalCategoryId = currentDoc?.category_id ?? null;
  }

  const stmt = db.prepare(
    `
      UPDATE documents 
      SET title = ?, slug = ?, category_id = ?, project_id = ?, content = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
  );
  stmt.run(title, slug, finalCategoryId, projectId, content, orderIndex, id);
};

export const deleteDocument = (id: number): void => {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  stmt.run(id);
};

export const getCompaniesWithProjectsAndDocuments = (): CompanyWithProjectsAndDocuments[] => {
  const companiesWithProjects = getCompaniesWithProjects();

  return companiesWithProjects.map(company => ({
    ...company,
    projects: company.projects.map(project => ({
      ...project,
      documents: getDocumentsByProject(project.id),
    })),
  }));
};

export const getSidebarProjectsData = (): SidebarProjectData[] => {
  const companies = getCompaniesWithProjectsAndDocuments();

  return companies
    .flatMap(company =>
      company.projects.map(project => ({
        id: project.id,
        name: project.name,
        companyId: company.id,
        companyName: company.name,
        documents: project.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          category_id: doc.category_id,
        })),
      }))
    )
    .filter(project => project.documents.length > 0);
};

// User operations
export const getUserByEmail = (email: string): User | undefined => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
};

export const createUser = (email: string, password: string, name: string): User => {
  const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
  const info = stmt.run(email, password, name);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as User;
};

export default db;

