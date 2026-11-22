'use client';

import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  CompanyFilter,
  ProjectFilter,
  ProjectFiltersProvider,
} from './ProjectFiltersContext';

interface ProjectWithMeta {
  id: number;
  name: string;
  companyId: number;
}

interface CompanyWithProjects {
  id: number;
  name: string;
  projects: ProjectWithMeta[];
}

interface ProjectFiltersManagerProps {
  companies: CompanyWithProjects[];
  children: ReactNode;
}

export default function ProjectFiltersManager({
  companies,
  children,
}: ProjectFiltersManagerProps) {
  const companyFilters = useMemo<CompanyFilter[]>(
    () => companies.map(company => ({ id: company.id, name: company.name })),
    [companies]
  );

  const projectFilters = useMemo<ProjectFilter[]>(
    () =>
      companies.flatMap(company =>
        company.projects.map(project => ({
          id: project.id,
          name: project.name,
          companyId: company.id,
        }))
      ),
    [companies]
  );

  const [selectedCompanyId, setSelectedCompanyIdState] = useState<number | null>(
    companyFilters[0]?.id ?? null
  );

  const [selectedProjectId, setSelectedProjectIdState] = useState<number | null>(
    () => {
      const firstCompanyId = companyFilters[0]?.id ?? null;
      if (!firstCompanyId) {
        return null;
      }

      const firstProject = projectFilters.find(
        project => project.companyId === firstCompanyId
      );
      return firstProject?.id ?? null;
    }
  );

  const setSelectedCompanyId = useCallback((companyId: number | null) => {
    setSelectedCompanyIdState(companyId);

    if (companyId === null) {
      setSelectedProjectIdState(null);
      return;
    }

    const firstProject = projectFilters.find(
      project => project.companyId === companyId
    );
    setSelectedProjectIdState(firstProject?.id ?? null);
  }, [projectFilters]);

  const setSelectedProjectId = useCallback((projectId: number | null) => {
    if (projectId === null) {
      setSelectedProjectIdState(null);
      return;
    }

    const project = projectFilters.find(item => item.id === projectId);
    if (!project) {
      setSelectedProjectIdState(null);
      return;
    }

    setSelectedCompanyIdState(project.companyId);
    setSelectedProjectIdState(project.id);
  }, [projectFilters]);

  const value = useMemo(
    () => ({
      companies: companyFilters,
      selectedCompanyId,
      setSelectedCompanyId,
      projects: projectFilters,
      selectedProjectId,
      setSelectedProjectId,
    }),
    [
      companyFilters,
      projectFilters,
      selectedCompanyId,
      selectedProjectId,
      setSelectedCompanyId,
      setSelectedProjectId,
    ]
  );

  return (
    <ProjectFiltersProvider value={value}>{children}</ProjectFiltersProvider>
  );
}

