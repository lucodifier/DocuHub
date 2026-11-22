'use client';

import ProjectFilters from './ProjectFilters';

export default function Header() {
  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-10">
      <ProjectFilters />
    </header>
  );
}

