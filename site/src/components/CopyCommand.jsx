import React, { useState } from 'react';

export default function CopyCommand({ command }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indisponível: ignora */
    }
  };
  return (
    <button
      onClick={copy}
      className="group mt-4 flex w-full items-center justify-between gap-3 border-2 border-ink bg-ink px-4 py-3 text-left font-mono text-sm text-paper"
    >
      <span className="overflow-x-auto whitespace-nowrap"><span className="text-amber">$</span> {command}</span>
      <span className="shrink-0 text-xs uppercase text-amber">{copied ? 'copiado' : 'copiar'}</span>
    </button>
  );
}
