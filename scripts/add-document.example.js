/**
 * Exemplo de como adicionar documentos programaticamente
 * 
 * Uso:
 * node scripts/add-document.example.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'documentation.db');
const db = new Database(dbPath);

// Exemplo 1: Adicionar nova categoria
function addCategory() {
  const stmt = db.prepare(`
    INSERT INTO categories (name, order_index) 
    VALUES (?, ?)
  `);
  
  const result = stmt.run('VI. NEW SECTION', 6);
  console.log(`✅ Categoria criada com ID: ${result.lastInsertRowid}`);
  return result.lastInsertRowid;
}

// Exemplo 2: Adicionar novo documento
function addDocument(categoryId) {
  const content = `# Meu Novo Documento 🎉

Este é um exemplo de documento criado programaticamente!

## Recursos

- ✅ Suporte a **Markdown**
- 🎨 Emojis funcionam perfeitamente
- 📝 Syntax highlighting para código

### Exemplo de Código

\`\`\`javascript
const hello = () => {
  console.log('Hello from DocuHub! 🚀');
};
\`\`\`

## Conclusão

Você pode criar quantos documentos quiser desta forma! 💪
`;

  const stmt = db.prepare(`
    INSERT INTO documents (title, slug, category_id, content, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    'Meu Novo Documento',
    'meu-novo-documento',
    categoryId,
    content,
    0
  );
  
  console.log(`✅ Documento criado com ID: ${result.lastInsertRowid}`);
  return result.lastInsertRowid;
}

// Exemplo 3: Listar todos os documentos
function listAllDocuments() {
  const docs = db.prepare(`
    SELECT 
      d.id,
      d.title,
      d.slug,
      c.name as category
    FROM documents d
    JOIN categories c ON d.category_id = c.id
    ORDER BY c.order_index, d.order_index
  `).all();
  
  console.log('\n📚 Documentos existentes:');
  docs.forEach(doc => {
    console.log(`  ${doc.id}. [${doc.category}] ${doc.title} (/${doc.slug})`);
  });
}

// Exemplo 4: Atualizar documento
function updateDocument(id, newContent) {
  const stmt = db.prepare(`
    UPDATE documents 
    SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(newContent, id);
  console.log(`✅ Documento ${id} atualizado`);
}

// Exemplo 5: Deletar documento
function deleteDocument(id) {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  stmt.run(id);
  console.log(`✅ Documento ${id} deletado`);
}

// ========================================
// Execute os exemplos (descomente para usar)
// ========================================

// Listar documentos atuais
listAllDocuments();

// Adicionar nova categoria e documento
// const categoryId = addCategory();
// addDocument(categoryId);

// Atualizar um documento existente
// updateDocument(1, '# Conteúdo atualizado\n\nNovo texto aqui!');

// Deletar um documento
// deleteDocument(99);

db.close();
console.log('\n✅ Concluído!');

