import React from 'react';
import Layout from '../components/Layout';
import Anchor from '../components/Anchor';
import CopyCommand from '../components/CopyCommand';

const REPO = 'https://github.com/lucodifier/DocuHub';

const STACK = ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind', 'SQLite', 'Mermaid', 'JWT', 'Docker', 'GitHub Actions'];

const LEVELS = [
  { n: '01', title: 'Empresa', text: 'O cliente ou a área dona da documentação.', color: 'bg-amber' },
  { n: '02', title: 'Projeto', text: 'Cada sistema, serviço ou produto da empresa.', color: 'bg-sky' },
  { n: '03', title: 'Documento', text: 'Páginas em Markdown, ordenadas como você quiser.', color: 'bg-coral' },
];

const FEATURES = [
  { icon: '📝', title: 'Markdown de verdade', text: 'GFM, tabelas, emojis e blocos de código com syntax highlighting.', span: 'md:col-span-2', color: 'bg-white' },
  { icon: '🔐', title: 'Admin protegido', text: 'JWT + bcrypt, cookie HTTP-only e middleware nas rotas /admin.', span: '', color: 'bg-amber' },
  { icon: '🔎', title: 'Busca e filtros', text: 'Filtro instantâneo na sidebar e navegador de projetos por empresa.', span: '', color: 'bg-sky' },
  { icon: '🐳', title: 'Um container só', text: 'Imagem Docker com SQLite em volume persistente, healthcheck e restart.', span: 'md:col-span-2', color: 'bg-coral' },
];

const MERMAID_SRC = `\`\`\`mermaid
flowchart LR
  A[Cliente] --> B[API]
  B --> C[(SQLite)]
  B --> D[Painel admin]
\`\`\``;

export default function Home() {
  return (
    <Layout>
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
        <div>
          <span className="tag bg-amber">self-hosted · open source</span>
          <h1 className="mt-6 text-5xl font-bold leading-[0.98] tracking-tight md:text-7xl">
            Documente.<br />
            Organize.<br />
            <span className="relative inline-block">
              <span className="relative z-10">Publique.</span>
              <span className="absolute -bottom-1 left-0 z-0 h-4 w-full -rotate-1 bg-amber md:h-5" />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg text-ink/80 md:text-xl">
            DocuHub reúne a documentação técnica de vários projetos em um site rápido: Markdown, diagramas Mermaid e um painel para quem escreve, tudo rodando em um único container.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href={REPO} target="_blank" rel="noopener" className="btn bg-amber">Ver no GitHub ↗</a>
            <Anchor to="comecar" className="btn bg-white">Rodar agora</Anchor>
          </div>
        </div>

        {/* mock */}
        <div className="relative">
          <div className="absolute -right-3 -top-4 z-10 rotate-6 border-2 border-ink bg-coral px-3 py-1 font-mono text-xs font-bold shadow-brut-sm">
            /docs/auth
          </div>
          <div className="brut overflow-hidden">
            <div className="flex items-center gap-2 border-b-2 border-ink bg-paper px-4 py-2">
              <i className="h-3 w-3 rounded-full border-2 border-ink bg-coral" />
              <i className="h-3 w-3 rounded-full border-2 border-ink bg-amber" />
              <i className="h-3 w-3 rounded-full border-2 border-ink bg-moss" />
              <span className="ml-3 font-mono text-xs text-ink/60">docuhub.local</span>
            </div>
            <div className="grid min-w-0 grid-cols-[130px_minmax(0,1fr)] font-mono text-xs">
              <div className="space-y-1 border-r-2 border-ink bg-paper/60 p-3">
                <div className="border-2 border-ink/30 bg-white px-2 py-1 text-ink/40">filtrar…</div>
                <div className="pt-2 font-bold">▾ Acme S.A.</div>
                <div className="pl-3 font-bold">▾ API Pagamentos</div>
                <div className="ml-3 bg-amber px-2 py-0.5 font-bold">Visão geral</div>
                <div className="pl-5">Autenticação</div>
                <div className="pl-3">▸ Portal Web</div>
              </div>
              <div className="space-y-3 p-4 font-sans text-sm">
                <div className="border-b-2 border-ink pb-2 text-xl font-bold">Visão geral</div>
                <p className="text-ink/70">Serviço de cobrança recorrente. Veja o fluxo:</p>
                <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
                  {['Cliente', 'API', 'Fila', 'Worker'].map((s, i, a) => (
                    <React.Fragment key={s}>
                      <span className="border-2 border-ink bg-sky px-2 py-1">{s}</span>
                      {i < a.length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="grid grid-cols-3 border-2 border-ink font-mono text-[11px]">
                  <span className="border-b-2 border-ink bg-ink px-2 py-1 text-paper">rota</span>
                  <span className="border-b-2 border-ink bg-ink px-2 py-1 text-paper">método</span>
                  <span className="border-b-2 border-ink bg-ink px-2 py-1 text-paper">auth</span>
                  <span className="px-2 py-1">/charges</span><span className="px-2 py-1">POST</span><span className="px-2 py-1">JWT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-paper">
        <div className="flex w-max animate-marquee gap-10 font-mono text-sm font-bold uppercase tracking-widest">
          {[...STACK, ...STACK].map((s, i) => (
            <span key={i} className="flex items-center gap-10">{s}<span className="text-amber">✦</span></span>
          ))}
        </div>
      </div>

      {/* HIERARQUIA */}
      <section id="hierarquia" className="mx-auto max-w-6xl px-5 py-24">
        <p className="kicker text-moss">// hierarquia</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Cada clique leva a um lugar previsível.
        </h2>
        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {LEVELS.map((l, i) => (
            <React.Fragment key={l.n}>
              <div className={`brut ${l.color} p-6`}>
                <span className="font-mono text-sm font-bold">{l.n}</span>
                <h3 className="mt-6 text-3xl font-bold">{l.title}</h3>
                <p className="mt-2 text-ink/80">{l.text}</p>
              </div>
              {i < LEVELS.length - 1 && (
                <div className="hidden place-items-center text-4xl font-bold md:grid">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="border-y-2 border-ink bg-paper/70 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="kicker text-moss">// recursos</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Leitura sem atrito, edição sob controle.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className={`brut ${f.color} ${f.span} p-6 transition-transform hover:-translate-y-1`}>
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-ink/80">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MERMAID */}
      <section id="mermaid" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-2">
        <div>
          <p className="kicker text-moss">// diagramas</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Diagrama é texto. Versionável.
          </h2>
          <p className="mt-5 text-lg text-ink/80">
            Escreva o diagrama num bloco <code className="bg-amber/60 px-1.5 font-mono text-base">mermaid</code> do próprio documento e o DocuHub renderiza na página. Sem exportar imagem, sem arquivo solto.
          </p>
        </div>
        <div className="space-y-5">
          <pre className="brut overflow-x-auto bg-ink p-5 font-mono text-sm leading-relaxed text-paper !shadow-brut">{MERMAID_SRC}</pre>
          <div className="text-center font-mono text-xs font-bold uppercase tracking-widest">↓ renderiza ↓</div>
          <div className="brut flex flex-wrap items-center justify-center gap-3 p-6 font-mono text-sm font-bold">
            <span className="border-2 border-ink bg-sky px-3 py-2">Cliente</span>→
            <span className="border-2 border-ink bg-amber px-3 py-2">API</span>→
            <span className="flex flex-col gap-2">
              <span className="border-2 border-ink bg-coral px-3 py-2">( SQLite )</span>
              <span className="border-2 border-ink bg-white px-3 py-2">Painel admin</span>
            </span>
          </div>
        </div>
      </section>

      {/* OPERAÇÃO */}
      <section id="operacao" className="border-y-2 border-ink bg-moss py-24 text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
          <div>
            <p className="kicker text-amber">// operação</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Atualizar não pode apagar conteúdo.
            </h2>
            <ul className="mt-6 space-y-3 text-lg">
              <li>▸ Pipeline no GitHub Actions publica a imagem no GHCR</li>
              <li>▸ Banco SQLite em volume persistente, fora do git</li>
              <li>▸ Scripts de backup e restore, com restauração no deploy</li>
              <li>▸ Healthcheck e restart automático</li>
            </ul>
          </div>
          <pre className="overflow-x-auto border-2 border-ink bg-ink p-6 font-mono text-sm leading-7 text-paper shadow-[6px_6px_0_0_#ffb62e]">
{`git push origin dev
  └─ Actions: build da imagem
       └─ push → GHCR

docker-compose up -d
  └─ volume docuhub-data
       └─ /app/data/documentation.db`}
          </pre>
        </div>
      </section>

      {/* COMEÇAR */}
      <section id="comecar" className="mx-auto max-w-6xl px-5 py-24">
        <p className="kicker text-moss">// começar</p>
        <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">Três comandos.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ['1', 'Instale', 'npm install'],
            ['2', 'Crie o banco', 'npm run db:setup'],
            ['3', 'Rode', 'npm run dev'],
          ].map(([n, t, c]) => (
            <div key={n} className="brut p-6">
              <span className="grid h-10 w-10 place-items-center border-2 border-ink bg-amber font-mono font-bold">{n}</span>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <CopyCommand command={c} />
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-ink/70">
          O <code className="font-mono">db:setup</code> cria um admin de exemplo. Troque a senha antes de usar de verdade. Prefere Docker? <code className="font-mono">docker-compose up -d</code>.
        </p>
      </section>
    </Layout>
  );
}
