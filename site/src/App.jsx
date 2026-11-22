import Dachshund from '@dachshund_framework/core';
import Home from './pages/Home';

const app = new Dachshund({
  baseUrl: 'https://lucodifier.github.io/DocuHub',
  scrollToTop: true,
});

// O router do Dachshund compara window.location.pathname com o path da rota.
// No GitHub Pages o site vive em /docuhub/, então registramos a rota com o base.
const base = import.meta.env.BASE_URL; // '/' em dev, '/docuhub/' no Pages

app.route(base, Home, {
  title: 'DocuHub — Documentação técnica self-hosted',
  description:
    'Plataforma self-hosted de documentação por empresa e projeto: Markdown, diagramas Mermaid, painel admin e deploy em um único container.',
  keywords: 'documentação, markdown, mermaid, nextjs, sqlite, docker',
});

export default app;
