import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProjectBrowser from '@/components/ProjectBrowser';
import ProjectFiltersManager from '@/components/ProjectFiltersManager';
import { getCompaniesWithProjectsAndDocuments } from '@/lib/db';
import { BookOpen, Layers, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const companies = getCompaniesWithProjectsAndDocuments();

  const totalDocs = companies.reduce(
    (acc, c) => acc + c.projects.reduce((pa, p) => pa + p.documents.length, 0),
    0
  );
  const totalProjects = companies.reduce((acc, c) => acc + c.projects.length, 0);

  const sidebarProjects = companies
    .flatMap(company =>
      company.projects.map(project => ({
        id: project.id,
        name: project.name,
        companyId: company.id,
        companyName: company.name,
        documents: project.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          category_id: doc.category_id,
        })),
      }))
    )
    .filter(project => project.documents.length > 0);

  const companyPreviews = companies.map(company => ({
    id: company.id,
    name: company.name,
    projects: company.projects.map(project => ({
      id: project.id,
      name: project.name,
      companyId: company.id,
      description: project.description,
      documents: project.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        updatedAt: doc.updated_at,
      })),
    })),
  }));

  const filterCompanies = companies.map(company => ({
    id: company.id,
    name: company.name,
    projects: company.projects.map(project => ({
      id: project.id,
      name: project.name,
      companyId: company.id,
    })),
  }));

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar projects={sidebarProjects} />

      <div className="flex-1 ml-80">
        <ProjectFiltersManager companies={filterCompanies}>
          <Header />

          <main className="p-8">
            <div className="max-w-5xl mx-auto">

              {/* Hero */}
              <div className="relative mb-10 overflow-hidden rounded-2xl border border-dark-border bg-dark-card px-8 py-10">
                {/* subtle grid bg */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />
                {/* glow */}
                <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                      <BookOpen size={13} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                      Documentação técnica
                    </span>
                  </div>

                  <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
                    Agroplay{' '}
                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      Docs
                    </span>
                  </h1>

                  <p className="text-dark-muted max-w-xl leading-relaxed">
                    Central de documentação dos projetos. Encontre guias, referências de API,
                    arquiteturas e decisões técnicas em um só lugar.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-dark-border bg-dark-hover px-3 py-1.5 text-xs text-dark-muted">
                      <BookOpen size={11} className="text-blue-400" />
                      <span>
                        <span className="font-semibold text-white">{totalDocs}</span>{' '}
                        {totalDocs === 1 ? 'documento' : 'documentos'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-dark-border bg-dark-hover px-3 py-1.5 text-xs text-dark-muted">
                      <Layers size={11} className="text-violet-400" />
                      <span>
                        <span className="font-semibold text-white">{totalProjects}</span>{' '}
                        {totalProjects === 1 ? 'projeto' : 'projetos'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-dark-border bg-dark-hover px-3 py-1.5 text-xs text-dark-muted">
                      <Building2 size={11} className="text-emerald-400" />
                      <span>
                        <span className="font-semibold text-white">{companies.length}</span>{' '}
                        {companies.length === 1 ? 'empresa' : 'empresas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <ProjectBrowser companies={companyPreviews} />
            </div>
          </main>
        </ProjectFiltersManager>
      </div>
    </div>
  );
}
