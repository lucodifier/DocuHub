'use client';

import { useEffect, useMemo, useState } from 'react';
import { Kanban, Plus, Save, Edit, Trash2, Building2 } from 'lucide-react';

interface AdminProject {
  id: number;
  company_id: number;
  company_name: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
}

interface AdminCompanyOption {
  id: number;
  name: string;
}

const emptyForm = {
  companyId: 0,
  name: '',
  slug: '',
  description: '',
  orderIndex: 0,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [companies, setCompanies] = useState<AdminCompanyOption[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsRes, companiesRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/companies'),
      ]);

      if (projectsRes.ok) {
        const projectData = await projectsRes.json();
        setProjects(projectData);
      } else {
        setError('Failed to load projects');
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        const companyOptions = companiesData.map((company: any) => ({
          id: company.id,
          name: company.name,
        }));
        setCompanies(companyOptions);
        if (formData.companyId === 0 && companyOptions.length > 0) {
          setFormData((prev) => ({ ...prev, companyId: companyOptions[0].id }));
        }
      } else {
        setError('Failed to load companies');
      }
    } catch (err) {
      setError('An error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyId || !formData.name.trim() || !formData.slug.trim()) {
      setError('Company, name and slug are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/projects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId ?? undefined,
          ...formData,
        }),
      });

      if (response.ok) {
        setFormData((prev) => ({
          ...emptyForm,
          companyId: companies[0]?.id ?? 0,
        }));
        setEditingId(null);
        await loadData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save project');
      }
    } catch (err) {
      setError('An error occurred while saving project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: AdminProject) => {
    setFormData({
      companyId: project.company_id,
      name: project.name,
      slug: project.slug,
      description: project.description ?? '',
      orderIndex: project.order_index ?? 0,
    });
    setEditingId(project.id);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project? Documents linked to it will also lose the relation.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete project');
      }
    } catch (err) {
      setError('An error occurred while deleting project');
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...emptyForm,
      companyId: companies[0]?.id ?? 0,
    }));
    setEditingId(null);
    setError('');
  };

  const companiesById = useMemo(() => {
    return companies.reduce<Record<number, string>>((acc, company) => {
      acc[company.id] = company.name;
      return acc;
    }, {});
  }, [companies]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
            <Kanban className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-dark-muted">
              Link documentation to companies and their specific initiatives
            </p>
          </div>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editingId ? 'Edit project' : 'Add new project'}
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Company <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.companyId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, companyId: Number(e.target.value) }))
              }
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
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
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Website redesign"
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
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="website-redesign"
              required
            />
            <p className="text-xs text-dark-muted mt-1">
              Used to reference the project programmatically
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Order</label>
            <input
              type="number"
              value={formData.orderIndex}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orderIndex: Number(e.target.value) || 0,
                }))
              }
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Short summary about this project"
            />
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              <span>{editingId ? 'Save changes' : 'Add project'}</span>
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-dark-muted">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-dark-card border border-dashed border-dark-border rounded-lg p-12 text-center">
          <p className="text-dark-muted mb-2">No projects yet</p>
          <p className="text-sm text-dark-muted">
            Create projects to organize documentation by company initiatives.
          </p>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-hover">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Project</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Company</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Slug</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-white">Order</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-dark-border hover:bg-dark-hover/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-dark-muted mt-1">{project.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-dark-muted">
                      <Building2 size={16} />
                      <span>{companiesById[project.company_id] || project.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-purple-400 text-sm">{project.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-dark-muted">{project.order_index ?? 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-hover text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-hover text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


