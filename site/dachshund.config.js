export default {
  global: {
    siteName: 'DocuHub',
    baseUrl: 'https://lucodifier.github.io/DocuHub',
    lang: 'pt-BR',
  },
  routes: {
    '/': {
      seo: {
        title: 'DocuHub — Documentação técnica self-hosted',
        description:
          'Plataforma self-hosted de documentação por empresa e projeto: Markdown, diagramas Mermaid, painel admin e deploy em um único container.',
        keywords: 'documentação, markdown, mermaid, nextjs, sqlite, docker, self-hosted',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: 'DocuHub',
          codeRepository: 'https://github.com/lucodifier/DocuHub',
          programmingLanguage: 'TypeScript',
          license: 'https://opensource.org/licenses/MIT',
        },
      },
    },
  },
  publicDir: 'public',
};
