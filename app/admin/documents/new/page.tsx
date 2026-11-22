'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';


interface Company {
  id: number;
  name: string;
  projects: {
    id: number;
    name: string;
  }[];
}

export default function NewDocumentPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    companyId: 0,
    projectId: 0,
    content: '',
    orderIndex: 0,
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const loadInitialData = async () => {
    try {
      const companiesRes = await fetch('/api/admin/companies');

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);

        if (companiesData.length > 0) {
          const firstCompany = companiesData[0];
          const firstProject = firstCompany.projects?.[0];
          setFormData((prev) => ({
            ...prev,
            companyId: prev.companyId || firstCompany.id,
            projectId:
              prev.projectId ||
              firstProject?.id ||
              0,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !formData.title ||
      !formData.slug ||
      !formData.companyId ||
      !formData.projectId ||
      !formData.content
    ) {
      setError('All fields marked with * are required');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/documents');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create document');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white mb-2">Create New Document</h1>
        <p className="text-dark-muted">Add a new documentation page</p>
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
              placeholder="Getting Started with DocuHub"
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
              placeholder="getting-started"
              required
            />
            <p className="text-xs text-dark-muted mt-1">URL: /docs/{formData.slug}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => {
                const companyId = parseInt(e.target.value, 10);
                const company = companies.find((c) => c.id === companyId);
                setFormData((prev) => ({
                  ...prev,
                  companyId,
                  projectId: company?.projects?.[0]?.id ?? 0,
                }));
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
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: parseInt(e.target.value, 10) })
              }
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              required
            >
              {companies
                .find((company) => company.id === formData.companyId)
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
              value={formData.orderIndex}
              onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="0"
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
              <MarkdownRenderer content={formData.content || '*No content yet*'} />
            </div>
          ) : (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-dark-card border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 font-mono text-sm"
              rows={20}
              placeholder="# Welcome! 👋&#10;&#10;Write your content in **Markdown** with emojis! 🚀"
              required
            />
          )}
          <p className="text-xs text-dark-muted mt-2">
            Supports Markdown, emojis, and code blocks
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            <span>{isSaving ? 'Saving...' : 'Create Document'}</span>
          </button>
          <Link
            href="/admin/documents"
            className="flex items-center space-x-2 bg-dark-hover hover:bg-dark-border text-white px-6 py-3 rounded-lg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

