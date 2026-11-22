'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, FileText, ArrowRight, X, Clock, Folder } from 'lucide-react';

import { useProjectFilters } from './ProjectFiltersContext';

interface DocumentPreview {
  id: number;
  title: string;
  slug: string;
  updatedAt: string;
}

interface ProjectPreview {
  id: number;
  name: string;
  companyId: number;
  description: string | null;
  documents: DocumentPreview[];
}

interface CompanyPreview {
  id: number;
  name: string;
  projects: ProjectPreview[];
}

interface ProjectBrowserProps {
  companies: CompanyPreview[];
}

export default function ProjectBrowser({ companies }: ProjectBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { selectedCompanyId, selectedProjectId, setSelectedProjectId } =
    useProjectFilters();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const allDocuments = useMemo(
    () =>
      companies.flatMap(company =>
        company.projects.flatMap(project =>
          project.documents.map(doc => ({
            ...doc,
            projectId: project.id,
            projectName: project.name,
            companyName: company.name,
          }))
        )
      ),
    [companies]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allDocuments.filter(doc => doc.title.toLowerCase().includes(q));
  }, [searchQuery, allDocuments]);

  const recentDocs = useMemo(
    () =>
      [...allDocuments]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [allDocuments]
  );

  const companiesWithProjects = useMemo(
    () => companies.filter(company => company.projects.length > 0),
    [companies]
  );

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return companiesWithProjects[0] ?? null;
    return (
      companiesWithProjects.find(company => company.id === selectedCompanyId) ??
      companiesWithProjects[0] ??
      null
    );
  }, [companiesWithProjects, selectedCompanyId]);

  const selectedProject = useMemo(() => {
    if (!selectedCompany || !selectedProjectId) return selectedCompany?.projects[0] ?? null;
    return (
      selectedCompany.projects.find(project => project.id === selectedProjectId) ??
      selectedCompany.projects[0] ??
      null
    );
  }, [selectedCompany, selectedProjectId]);

  if (companiesWithProjects.length === 0) {
    return (
      <div className="rounded-xl border border-dark-border bg-dark-card p-10 text-center text-dark-muted">
        Nenhuma empresa com projetos cadastrados.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none"
          size={17}
        />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar documento por título..."
          className="w-full rounded-xl border border-dark-border bg-dark-card py-3.5 pl-11 pr-16 text-white placeholder-dark-muted transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-dark-muted hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-1 rounded border border-dark-border bg-dark-hover px-1.5 py-0.5 text-[11px] text-dark-muted">
              <span className="text-sm leading-none">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {searchResults !== null ? (
        /* ── Search results view ── */
        <div className="space-y-4">
          <p className="text-sm text-dark-muted">
            {searchResults.length === 0
              ? `Nenhum documento encontrado para "${searchQuery}"`
              : `${searchResults.length} documento${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {searchResults.map(doc => (
              <Link
                key={doc.id}
                href={`/docs/${doc.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="mt-0.5 shrink-0 rounded-md bg-blue-500/10 p-1.5 text-blue-400">
                  <FileText size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-blue-400">
                    {doc.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-dark-muted">
                    {doc.companyName} › {doc.projectName}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="mt-0.5 shrink-0 text-dark-muted transition-colors group-hover:text-blue-400"
                />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── Recently updated ── */}
          {recentDocs.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Clock size={13} className="text-dark-muted" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
                  Atualizados recentemente
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recentDocs.map(doc => {
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(doc.updatedAt).getTime()) / 86_400_000
                  );
                  const isNew = daysAgo <= 7;
                  return (
                    <Link
                      key={doc.id}
                      href={`/docs/${doc.slug}`}
                      className="group flex items-start gap-3 rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
                    >
                      <div className="mt-0.5 shrink-0 rounded-md bg-blue-500/10 p-1.5 text-blue-400">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-blue-400">
                            {doc.title}
                          </h3>
                          {isNew && (
                            <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                              novo
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-dark-muted">{doc.projectName}</p>
                        <p className="mt-1 text-[11px] text-dark-muted/60">
                          {daysAgo === 0
                            ? 'hoje'
                            : daysAgo === 1
                            ? 'ontem'
                            : `há ${daysAgo} dias`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Project browser ── */}
          {selectedCompany && (
            <section className="space-y-8">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Folder size={13} className="text-dark-muted" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
                    Projetos de {selectedCompany.name}
                  </h2>
                </div>
                {selectedCompany.projects.length === 0 ? (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-6 text-center text-dark-muted">
                    Nenhum projeto cadastrado para esta empresa.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedCompany.projects.map(project => {
                      const isActive = project.id === selectedProject?.id;
                      const count = project.documents.length;
                      return (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProjectId(project.id)}
                          className={`group rounded-xl border p-5 text-left transition-all ${
                            isActive
                              ? 'border-blue-500/70 bg-blue-500/10 shadow-lg shadow-blue-500/5'
                              : 'border-dark-border bg-dark-card hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-dark-muted">
                                Projeto
                              </span>
                              <h3
                                className={`mt-1 text-base font-semibold leading-tight ${
                                  isActive ? 'text-blue-400' : 'text-white group-hover:text-blue-400'
                                } transition-colors`}
                              >
                                {project.name}
                              </h3>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                isActive
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-dark-hover text-dark-muted'
                              }`}
                            >
                              {count}
                            </span>
                          </div>
                          {project.description && (
                            <p className="mt-2 line-clamp-2 text-xs text-dark-muted">
                              {project.description}
                            </p>
                          )}
                          <p className="mt-3 text-xs text-dark-muted/60">
                            {count === 1 ? '1 documento' : `${count} documentos`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-dark-muted" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
                      {selectedProject ? selectedProject.name : 'Documentos'}
                    </h2>
                  </div>
                  {selectedProject && (
                    <span className="text-xs text-dark-muted/60">
                      {selectedProject.documents.length}{' '}
                      {selectedProject.documents.length === 1 ? 'doc' : 'docs'}
                    </span>
                  )}
                </div>

                {selectedProject && selectedProject.documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selectedProject.documents.map(doc => {
                      const formattedDate = new Date(doc.updatedAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                      const daysAgo = Math.floor(
                        (Date.now() - new Date(doc.updatedAt).getTime()) / 86_400_000
                      );
                      return (
                        <Link
                          key={doc.id}
                          href={`/docs/${doc.slug}`}
                          className="group flex items-start gap-3 rounded-xl border border-dark-border bg-dark-card p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
                        >
                          <div className="mt-0.5 shrink-0 rounded-md bg-dark-hover p-1.5 text-dark-muted transition-colors group-hover:bg-blue-500/10 group-hover:text-blue-400">
                            <FileText size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-white transition-colors group-hover:text-blue-400 leading-snug">
                              {doc.title}
                            </h3>
                            <p className="mt-2 text-[11px] text-dark-muted/70">
                              Atualizado {daysAgo === 0 ? 'hoje' : daysAgo === 1 ? 'ontem' : `em ${formattedDate}`}
                            </p>
                          </div>
                          <ArrowRight
                            size={14}
                            className="mt-0.5 shrink-0 text-dark-muted/40 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400"
                          />
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center text-dark-muted">
                    Nenhum documento cadastrado para este projeto.
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
