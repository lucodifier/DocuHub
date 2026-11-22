import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { getSidebarProjectsData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function StyleGuidePage() {
  const sidebarProjects = getSidebarProjectsData();

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar projects={sidebarProjects} />
      
      <div className="flex-1 ml-80">
        <Header />
        
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Style Guide</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-dark-muted">
                Esta página demonstra os estilos disponíveis na documentação.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

