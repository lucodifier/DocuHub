'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export interface SidebarDocument {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
}

export interface SidebarProject {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  documents: SidebarDocument[];
}

interface SidebarProps {
  projects: SidebarProject[];
}

export default function Sidebar({ projects }: SidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects
      .map(project => {
        const projectMatches =
          project.name.toLowerCase().includes(q) ||
          project.companyName.toLowerCase().includes(q);
        const filteredDocs = project.documents.filter(doc =>
          doc.title.toLowerCase().includes(q)
        );
        if (projectMatches) return project;
        if (filteredDocs.length > 0) return { ...project, documents: filteredDocs };
        return null;
      })
      .filter(Boolean) as SidebarProject[];
  }, [projects, search]);

  // Expandir todos quando buscando
  useEffect(() => {
    if (search.trim()) {
      setExpandedCategories(filteredProjects.map(p => p.id));
    }
  }, [search, filteredProjects]);

  // Expandir automaticamente o projeto do documento atual
  useEffect(() => {
    if (pathname?.startsWith('/docs/')) {
      const currentSlug = pathname.replace('/docs/', '');
      const projectWithCurrentDoc = projects.find(project =>
        project.documents.some(doc => doc.slug === currentSlug)
      );
      if (projectWithCurrentDoc && !expandedCategories.includes(projectWithCurrentDoc.id)) {
        setExpandedCategories(prev => [...prev, projectWithCurrentDoc.id]);
      }
    }
  }, [pathname, projects]);

  const toggleCategory = (projectId: number) => {
    setExpandedCategories(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <aside className="w-80 bg-dark-bg border-r border-dark-border h-screen overflow-y-auto fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-dark-bg text-xl">📚</span>
          </div>
          <span className="text-xl font-semibold text-white">Agroplay Docs</span>
        </Link>

        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full bg-dark-hover border border-dark-border rounded-md py-2 pl-8 pr-3 text-sm text-white placeholder-dark-muted focus:outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        <nav className="space-y-1">
          {filteredProjects.length === 0 && search.trim() && (
            <p className="text-sm text-dark-muted text-center py-4">Nenhum resultado encontrado</p>
          )}
          {filteredProjects.map(project => {
            const isExpanded = expandedCategories.includes(project.id);
            const hasDocuments = project.documents.length > 0;

            return (
              <div key={project.id} className="mb-4">
                <button
                  onClick={() => toggleCategory(project.id)}
                  className="flex items-center justify-between w-full rounded px-3 py-3 text-left transition-colors hover:bg-dark-hover"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-dark-muted">
                      Projeto
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {project.name}
                    </span>
                    <span className="text-xs text-dark-muted">{project.companyName}</span>
                  </div>
                  {hasDocuments && (
                    <span className="text-dark-muted">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  )}
                </button>

                {isExpanded && hasDocuments && (
                  <div className="mt-2 space-y-1">
                    <span className="block px-3 text-[10px] uppercase tracking-[0.2em] text-dark-muted">
                      Documentos
                    </span>
                    {project.documents.map(doc => {
                      const isActive = pathname === `/docs/${doc.slug}`;
                      return (
                        <Link
                          key={doc.id}
                          href={`/docs/${doc.slug}`}
                          className={`block rounded px-3 py-2 text-sm transition-colors ml-4 ${
                            isActive
                              ? 'bg-dark-hover text-white font-medium'
                              : 'text-dark-muted hover:text-white hover:bg-dark-hover'
                          }`}
                        >
                          {doc.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="h-6" />
    </aside>
  );
}
