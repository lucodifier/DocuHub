import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getDocumentBySlug, getSidebarProjectsData } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function DocumentPage({ params }: PageProps) {
  const document = getDocumentBySlug(params.slug);

  if (!document) {
    notFound();
  }

  const sidebarProjects = getSidebarProjectsData();

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar projects={sidebarProjects} />
      
      <div className="flex-1 ml-80">
        <Header />
        
        <main className="p-8">
          <article className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="text-sm text-dark-muted mb-1 space-x-1">
                {document.company_name && (
                  <>
                    <span>{document.company_name}</span>
                    {document.project_name && (
                      <>
                        <span>•</span>
                        <span>{document.project_name}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {document.title}
              </h1>
              <div className="text-sm text-dark-muted">
                Last updated: {new Date(document.updated_at).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <MarkdownRenderer content={document.content} />

            <div className="mt-12 pt-8 border-t border-dark-border">
              <p className="text-sm text-dark-muted">
                Última atualização em{' '}
                {new Date(document.updated_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}

