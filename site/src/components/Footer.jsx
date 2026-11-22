import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 font-mono text-sm">
        <span>© 2026 DocuHub · MIT · por <a className="underline" href="https://github.com/lucodifier" target="_blank" rel="noopener">lucodifier</a></span>
        <span className="flex gap-5">
          <a className="underline" href="https://github.com/lucodifier/DocuHub" target="_blank" rel="noopener">código</a>
          <a className="underline" href="https://lucodifier.github.io/dachshund-landing/" target="_blank" rel="noopener">feito com Dachshund 🐕</a>
        </span>
      </div>
    </footer>
  );
}
