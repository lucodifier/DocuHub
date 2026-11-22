'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, Save, Edit, Trash2, FolderKanban } from 'lucide-react';

interface AdminProject {
  id: number;
  company_id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface AdminCompany {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  projects: AdminProject[];
}

const emptyForm = { name: '', description: '' };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        setError('Failed to load companies');
      }
    } catch (err) {
      setError('An error occurred while loading companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/companies', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId ?? undefined, ...formData }),
      });

      if (response.ok) {
        setFormData(emptyForm);
        setEditingId(null);
        await loadCompanies();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save company');
      }
    } catch (err) {
      setError('An error occurred while saving company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (company: AdminCompany) => {
    setFormData({ name: company.name, description: company.description ?? '' });
    setEditingId(company.id);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this company? Projects and documents linked to it will also be removed.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCompanies();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete company');
      }
    } catch (err) {
      setError('An error occurred while deleting company');
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setError('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Companies</h1>
              <p className="text-dark-muted">Manage companies and their documentation projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editingId ? 'Edit company' : 'Add new company'}
          </h2>
          {editingId && (
            <button
              onClick={handleCancel}
              className="text-sm text-dark-muted hover:text-white transition-colors"
            >
              Cancel edit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-white mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Agroplay"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Describe what this company or business unit is responsible for"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingId ? 'Save changes' : 'Add company'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-dark-muted">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="bg-dark-card border border-dashed border-dark-border rounded-lg p-12 text-center">
          <p className="text-dark-muted mb-2">No companies yet</p>
          <p className="text-sm text-dark-muted">
            Create a company to start organizing documentation projects.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-dark-card border border-dark-border rounded-lg p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
                <div>
                  <h3 className="text-xl font-semibold text-white">{company.name}</h3>
                  {company.description && (
                    <p className="text-sm text-dark-muted mt-1">{company.description}</p>
                  )}
                  <p className="text-xs text-dark-muted mt-2">
                    Created on {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-hover text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-hover text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-dark-border pt-4">
                <div className="flex items-center space-x-2 text-dark-muted text-sm mb-3">
                  <FolderKanban size={16} />
                  <span>Projects</span>
                  <span className="text-dark-muted/60">
                    ({company.projects?.length ?? 0})
                  </span>
                </div>

                {company.projects && company.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-dark-bg border border-dark-border rounded-lg p-4"
                      >
                        <p className="text-white font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-dark-muted mt-1">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-dark-muted mt-2">
                          Slug:{' '}
                          <span className="text-blue-400">
                            {project.slug}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-dark-muted">
                    No projects linked yet. Create one in the Projects tab.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


