'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';


interface Document {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  company_id?: number | null;
  project_id?: number | null;
  content: string;
  order_index: number;
}

interface Company {
  id: number;
  name: string;
  projects: {
    id: number;
    name: string;
  }[];
}

export default function EditDocumentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState<Document | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [docsRes, companiesRes] = await Promise.all([
        fetch('/api/admin/documents'),
        fetch('/api/admin/companies'),
      ]);

      if (docsRes.ok) {
        const docs = await docsRes.json();

        const doc = docs.find((d: Document) => d.id === parseInt(params.id, 10));
        if (doc) {
          setFormData({
            ...doc,
            company_id: doc.company_id ?? undefined,
            project_id: doc.project_id ?? undefined,
          });
        } else {
          setError('Document not found');
        }
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
        if (!formData?.company_id && companiesData.length > 0) {
          const firstCompany = companiesData[0];
          const firstProject = firstCompany.projects?.[0];
          setFormData((prev) =>
            prev
              ? {
                  ...prev,
                  company_id: prev.company_id ?? firstCompany.id,
                  project_id: prev.project_id ?? firstProject?.id ?? undefined,
                }
              : prev
          );
        }
      }
    } catch (error) {
      setError('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setError('');

    if (
      !formData.title ||
      !formData.slug ||
      !formData.project_id ||
      !formData.content
    ) {
      setError('All fields marked with * are required');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          slug: formData.slug,
          categoryId: formData.category_id ?? null,
          projectId: formData.project_id,
          content: formData.content,
          orderIndex: formData.order_index,
        }),
      });

      if (response.ok) {
        router.push('/admin/documents');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update document');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData || !confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents?id=${formData.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/documents');
      } else {
        setError('Failed to delete document');
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="text-white">Loading...</div>
    );
  }

  if (!formData) {
    return (
      <div className="text-white">Document not found</div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/documents"
          className="inline-flex items-center space-x-2 text-dark-muted hover:text-white mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Documents</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Edit Document</h1>
        <p className="text-dark-muted">Update your documentation page</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-dark-muted mt-1">URL: /docs/{formData.slug}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.company_id ?? 0}
              onChange={(e) => {
                const companyId = parseInt(e.target.value, 10);
                const company = companies.find((c) => c.id === companyId);
                setFormData({
                  ...formData,
                  company_id: companyId,
                  project_id: company?.projects?.[0]?.id ?? undefined,
                });
              }}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Project <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.project_id ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  project_id: parseInt(e.target.value, 10),
                })
              }
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            >
              {companies
                .find((company) => company.id === (formData.company_id ?? 0))
                ?.projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                )) ?? (
                <option value={0} disabled>
                  No projects available
                </option>
              )}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-white mb-2">Order Index</label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Content (Markdown) <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <div className="bg-dark-card border border-dark-border rounded-lg p-6 min-h-[400px]">
              <MarkdownRenderer content={formData.content} />
            </div>
          ) : (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 font-mono text-sm"
              rows={20}
              required
            />
          )}
          <p className="text-xs text-dark-muted mt-2">
            Supports Markdown, emojis, and code blocks
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <Link
              href="/admin/documents"
              className="flex items-center space-x-2 bg-dark-hover hover:bg-dark-border text-white px-6 py-3 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-3 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
            <span>Delete</span>
          </button>
        </div>
      </form>
    </div>
  );
}

