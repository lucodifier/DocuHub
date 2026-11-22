import React from 'react';

// O Dachshund intercepta todo <a> do mesmo domínio e troca por navegação SPA,
// o que quebraria âncoras (#secao). Aqui rolamos até o elemento e impedimos
// que o clique chegue ao listener global do framework.
export default function Anchor({ to, className = '', children }) {
  const onClick = (e) => {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    document.getElementById(to)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <a href={`#${to}`} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
