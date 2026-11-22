'use client';

import { useEffect, useRef, useState } from 'react';

let initialized = false;

async function getMermaid() {
  const { default: mermaid } = await import('mermaid');
  if (!initialized) {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
    initialized = true;
  }
  return mermaid;
}

export default function MermaidBlock({ code }: { code: string }) {
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2)}`).current;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSvg('');
    setError('');

    getMermaid()
      .then(mermaid => mermaid.render(id, code.trim()))
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setError('Diagrama inválido ou sintaxe não suportada nesta versão.');
      });

    return () => { cancelled = true; };
  }, [code, id]);

  if (error) {
    return (
      <div className="my-4 rounded border border-red-500/30 bg-red-950/20 p-3">
        <p className="mb-2 text-xs font-semibold text-red-400">Erro no diagrama Mermaid</p>
        <pre className="text-xs text-gray-400 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center gap-2 rounded border border-gray-700 bg-gray-800/50 p-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-gray-200" />
        <span className="text-sm text-gray-400">Renderizando diagrama...</span>
      </div>
    );
  }

  return (
    <div
      className="mermaid-diagram my-4 overflow-x-auto rounded border border-gray-700 bg-gray-900/60 p-4 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
