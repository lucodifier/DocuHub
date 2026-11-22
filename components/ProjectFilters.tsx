'use client';

import { useMemo } from 'react';

import { useOptionalProjectFilters } from './ProjectFiltersContext';

export default function ProjectFilters() {
  const context = useOptionalProjectFilters();

  if (!context) {
    return null;
  }

  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    projects,
    selectedProjectId,
    setSelectedProjectId,
  } = context;

  const projectsForCompany = useMemo(
    () =>
      projects.filter(project =>
        selectedCompanyId ? project.companyId === selectedCompanyId : true
      ),
    [projects, selectedCompanyId]
  );

  return (
    <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:gap-6">
      <div className="flex w-full flex-col gap-2 md:flex-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
          Empresa
        </label>
        <select
          className="w-full rounded border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500"
          value={selectedCompanyId ?? ''}
          onChange={event => {
            const value = event.target.value;
            setSelectedCompanyId(value ? Number(value) : null);
          }}
        >
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-full flex-col gap-2 md:flex-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
          Projeto
        </label>
        <select
          className="w-full rounded border border-dark-border bg-dark-bg px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:text-dark-muted"
          value={selectedProjectId ?? ''}
          onChange={event => {
            const value = event.target.value;
            setSelectedProjectId(value ? Number(value) : null);
          }}
          disabled={projectsForCompany.length === 0}
        >
          {projectsForCompany.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

