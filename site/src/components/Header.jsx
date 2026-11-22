import React from 'react';
import Anchor from './Anchor';

const REPO = 'https://github.com/lucodifier/DocuHub';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Anchor to="top" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border-2 border-ink bg-amber font-mono text-lg font-bold shadow-brut-sm">
            D
          </span>
          <span className="text-xl font-bold tracking-tight">DocuHub</span>
        </Anchor>
        <div className="hidden items-center gap-7 font-medium md:flex">
          <Anchor to="hierarquia" className="hover:underline decoration-2 underline-offset-4">Hierarquia</Anchor>
          <Anchor to="recursos" className="hover:underline decoration-2 underline-offset-4">Recursos</Anchor>
          <Anchor to="mermaid" className="hover:underline decoration-2 underline-offset-4">Mermaid</Anchor>
          <Anchor to="operacao" className="hover:underline decoration-2 underline-offset-4">Operação</Anchor>
        </div>
        <a href={REPO} target="_blank" rel="noopener" className="btn bg-ink text-paper !shadow-none hover:!shadow-brut-sm py-2 text-sm">
          GitHub ↗
        </a>
      </nav>
    </header>
  );
}
