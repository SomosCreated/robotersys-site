# Fase 4 — Blog (Keystatic) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Blog multilíngue: **content collection MDX** (posts por idioma), páginas de **índice + post** por idioma, **painel Keystatic** em `/keystatic` (storage GitHub, conta editorial compartilhada), **migração** dos posts PT+EN do site atual, e o **teaser real** na home.

**Architecture:** As páginas do blog são **estáticas (SSG)**, geradas de uma **Astro content collection** (`blog`) cujo conteúdo são arquivos MDX em `src/content/blog/`. O **Keystatic** é só a UI de edição por cima desses arquivos — em **dev usa `local`**, em **produção usa `github`** (commit → rebuild Vercel). O painel `/keystatic` é uma rota server (`prerender=false`); o blog público continua estático. Cada post tem `language`; o índice de cada idioma filtra por ele (PT e EN têm posts; ES/DE começam vazios com estado "em breve").

**Tech Stack:** `@keystatic/core` + `@keystatic/astro` + `@astrojs/react` + `react`/`react-dom`, `@astrojs/mdx`, Astro content collections, o i18n/tema/Ubuntu já existentes.

**Dependência (não bloqueia o build):** a edição ao vivo pelo cliente exige uma **GitHub App do Keystatic + a conta editorial** conectadas ao repo (passo do usuário). O build do blog (páginas a partir do MDX) **não** depende disso.

## Arquitetura

**Content collection** (`src/content.config.ts` ou `src/content/config.ts`): coleção `blog` com schema Zod: `title`, `excerpt`, `language` ('pt'|'en'|'es'|'de'), `category`, `author`, `coverImage` (image()), `publishedAt` (date), `draft` (bool), `seo` (opcional). Slug = nome do arquivo. Corpo = MDX.

**Rotas do blog (i18n, slugs já no ROUTES? não — blog é dinâmico):**
- Índice: `/blog/` (PT) + `/en/blog/`, `/es/blog/`, `/de/blog/` — lista posts com `language === locale`, ordenados por data, com `BlogCard`. Estado vazio amigável quando não houver posts (ES/DE).
- Post: `/blog/<slug>/` (PT) + `/<locale>/blog/<slug>/` — via `getStaticPaths` sobre a collection (gera só os posts do locale). Renderiza o MDX num `BlogLayout` (título, meta, capa, corpo prose, CTA, conteúdo relacionado).
- Atualizar o item "Blog" do nav (Header/Footer) — já aponta pra `/blog/` etc. (Fase 3 deixou pronto); confirmar que resolve.
- **Home teaser**: o bloco "Últimos conteúdos" (hoje placeholder) → 3 posts mais recentes do locale via a collection.

**Keystatic** (`keystatic.config.ts`): `collection('posts', { path: 'src/content/blog/*', slugField, schema: { title, excerpt, language(select), category, author, coverImage(image), publishedAt(date), draft, content(mdx/markdoc) } })`. `storage`: `local` em dev, `github` (repo) em prod. Rotas `src/pages/keystatic/[...params].astro` + API, via `@keystatic/astro`. `output` muda p/ `hybrid`/server conforme necessário (páginas seguem `prerender` default). `noindex` no /keystatic.

**Prosa do post**: reusar `ProseSection`/estilo de prosa tematizado (tokens, Ubuntu), `astro:assets` p/ capa/imagens. WCAG AA, reduced-motion.

---

## M1 — Content collection + páginas do blog (índice/post) + teaser
**Files:** `src/content.config.ts`, `src/components/BlogCard.astro` (existe? reusar/ajustar), `src/page-templates/BlogIndex.astro` + `BlogPost.astro` (ou layouts), rotas `src/pages/blog/...` + `src/pages/{en,es,de}/blog/...`, ajustar `Home.astro` teaser, `@astrojs/mdx`.
- [ ] Instalar `@astrojs/mdx`; definir a collection `blog` (schema acima); criar **2–3 posts MDX de amostra** (PT + EN) p/ build (ex.: paletização, manutenção de emergência) com `// SAMPLE` (serão substituídos na M3).
- [ ] Índice por idioma (filtra `language`, ordena por data, estado vazio p/ ES/DE) + post page via `getStaticPaths` por locale, num `BlogLayout` tematizado. Breadcrumb `Início > Blog > <post>`, `BlogPosting` JSON-LD.
- [ ] Home: trocar o teaser placeholder por 3 posts recentes do locale (fallback gracioso se vazio).
- [ ] i18n: strings do blog (índice/estado vazio/"Saiba mais"/"Voltar ao blog"/meta) em `t(locale, 'blog.*')` nos 4 dicts (DE marcado).
- [ ] Verificar build/check/test; `/blog/`, `/en/blog/`, e um post `/blog/<slug>/` geram. Commit.

## M2 — Painel Keystatic ✅ (2026-06-13)
**Files:** `keystatic.config.ts` (novo), `astro.config.mjs` (react + keystatic integrations), `public/robots.txt` (noindex /keystatic), `package.json` (deps).
**Nota:** A integração `@keystatic/astro` injeta as rotas `/keystatic/[...params]` e `/api/keystatic/[...params]` automaticamente — não é necessário criar arquivos de rota manualmente. `output: 'hybrid'` foi removido no Astro v5; `output: 'static'` já suporta `prerender = false` em rotas individuais (comportamento idêntico).
**Formato de conteúdo:** MDX (`fields.mdx`), não markdoc — mantém compatibilidade total com os posts existentes (`.mdx`) e com `@astrojs/mdx`. Veja comentário em `keystatic.config.ts`.
- [x] Instalar Keystatic + React; `keystatic.config.ts` com a collection `posts` mapeada **exatamente** ao schema da content collection (mesmos campos/caminho `src/content/blog/*`). `storage`: `local` em dev / `github` (SomosCreated/robotersys-site) quando `import.meta.env.PROD` — documentado em comentário no config.
- [x] Rotas do painel (`/keystatic`) + API injetadas pelo `@keystatic/astro`; `output: 'static'` (v5 equivalent); `/keystatic` com `noindex` via `public/robots.txt`; páginas públicas estáticas confirmadas, painel é função server.
- [x] `astro check` 0 erros; `npm run build` sem erros; `npm test` 50/50; `/keystatic` builda como `_render.func`; blog/home são HTML estático. Commit. (Edição via GitHub aguarda GitHub App do usuário.)

## M3 — Migração dos posts reais (PT + EN)
- [ ] Subagente: coletar os posts do site atual — PT em `https://robotersys.com/category/pt/` (e as URLs dos posts) + os artigos **EN** (taxonomia EN). Para cada: extrair título, data, conteúdo, capa; converter para **MDX** em `src/content/blog/` com o frontmatter do schema + `language`. Baixar as imagens (capa) p/ `src/assets/blog/`. Remover os posts `// SAMPLE`. Preservar slugs antigos → mapa de **redirect 301** (anotar p/ Fase 5).
- [ ] Verificar build com os posts reais; índices PT/EN populados. Commit.

## M4 — Verificação + revisão + merge
- [ ] `astro check`/`build`/`test`; passe visual (índice do blog PT + EN, um post, o /keystatic carregando, o teaser na home) nos 2 temas; estado vazio ES/DE ok.
- [ ] Revisão final independente. Corrigir achados. Merge `--no-ff` na main + cleanup.

## Self-Review (preenchido)
- **Cobertura:** content collection + índice/post por idioma (M1), Keystatic admin github/local (M2), migração PT+EN (M3), verificação (M4). Teaser real na home (M1). Nav já liga o blog (Fase 3).
- **Riscos:** API do Keystatic (consultar docs); `output: hybrid` + as rotas do painel não podem quebrar o SSG das páginas públicas; edição ao vivo depende da GitHub App (passo do usuário) — mas o build não. ES/DE sem posts → estado vazio explícito.
- **Consistência:** schema da content collection == schema do Keystatic; posts por `language`; prosa/tema/Ubuntu reusados; slugs antigos → redirects (Fase 5).
