 'use client';
import { createContext, useContext } from 'react';

export interface CompanyFilter {
  id: number;
  name: string;
}

export interface ProjectFilter {
  id: number;
  name: string;
  companyId: number;
}

export interface ProjectFiltersState {
  companies: CompanyFilter[];
  selectedCompanyId: number | null;
  setSelectedCompanyId: (id: number | null) => void;
  projects: ProjectFilter[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
}

const ProjectFiltersContext = createContext<ProjectFiltersState | null>(null);

export const ProjectFiltersProvider = ProjectFiltersContext.Provider;

export function useOptionalProjectFilters() {
  return useContext(ProjectFiltersContext);
}

export function useProjectFilters() {
  const context = useContext(ProjectFiltersContext);
  if (!context) {
    throw new Error('useProjectFilters must be used within ProjectFiltersProvider');
  }
  return context;
}


