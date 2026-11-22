'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, Search, X } from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  project_id: number | null;
  project_name: string | null;
  company_id: number | null;
  company_name: string | null;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(doc => doc.title.toLowerCase().includes(q));
  }, [documents, searchQuery]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadDocuments();
        setError('');
      } else {
        setError('Failed to delete document');
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-dark-muted">Manage your documentation</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>New Document</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full max-w-sm bg-dark-card border border-dark-border text-white rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-dark-muted"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-dark-muted">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
          <p className="text-dark-muted mb-4">No documents yet</p>
          <Link
            href="/admin/documents/new"
            className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Create First Document</span>
          </Link>
        </div>
      ) : (
        <>
        {searchQuery && (
          <p className="mb-3 text-sm text-dark-muted">
            {filteredDocuments.length === 0
              ? `Nenhum documento encontrado para "${searchQuery}"`
              : `${filteredDocuments.length} de ${documents.length} documentos`}
          </p>
        )}
        <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-hover">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Title</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Company</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Project</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Slug</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Updated</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-t border-dark-border hover:bg-dark-hover/50">
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{doc.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-dark-muted text-sm">
                      {doc.company_name ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-dark-muted text-sm">
                      {doc.project_name ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-blue-400 text-sm">/{doc.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-dark-muted text-sm">
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/docs/${doc.slug}`}
                        target="_blank"
                        className="p-2 bg-dark-hover hover:bg-purple-500/20 text-purple-400 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/documents/${doc.id}`}
                        className="p-2 bg-dark-hover hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 bg-dark-hover hover:bg-red-500/20 text-red-400 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

