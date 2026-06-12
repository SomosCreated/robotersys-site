# Fase 1 — Fundação + Design System (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ter um projeto Astro funcionando que renderiza a **Home da RoboterSys em PT** com o design system de referência (dark/laranja, efeitos), deployável na Vercel, com base de tokens, layout, Header/Footer/Hero/Serviços e o harness de testes prontos.

**Architecture:** Astro (static) + Tailwind v3.4. Os tokens são o Tailwind padrão; portamos o plugin de utilitários 3D e o `components.css` da referência (`docs/reference/design-system/`). UI é HTML/CSS; interatividade entra como pequenos `<script>`/islands (reveal, spotlight, parallax), sempre atrás de `prefers-reduced-motion`/`hover:hover`. Strings em dicionário (`src/i18n/pt.ts`) desde já, para a Fase 3 (i18n) só adicionar idiomas.

**Tech Stack:** Astro 5, TypeScript (strict), Tailwind CSS v3.4 (`@astrojs/tailwind`), `@astrojs/vercel`, `astro-icon` + `@iconify-json/solar`, `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono`, `astro:assets` (Sharp), Vitest.

**Referência do design system (no repo):** `docs/reference/design-system/` — `design-system.html` (markup), `assets/css/components.css` (efeitos), `assets/js/tailwind-config.js` (plugin 3D), `assets/js/interactions.js` (lógica das interações). **Porte a partir desses arquivos**, aplicando as transformações da Task 11 (renomear AERO_SYS→RoboterSys, trocar copy, subir contraste p/ WCAG AA).

## Estratégia de testes (pragmática)

Site majoritariamente apresentacional → TDD não se aplica a `<div>`. Regra:
- **Lógica pura** (helper i18n `t()`, futuras: recomendação do seletor, validação do form, builders de JSON-LD) → **TDD com Vitest** (test falha → implementa → passa).
- **Componentes/páginas visuais** → verificação por **`astro build` sem erros** + **`astro preview` (inspeção visual)** + **orçamento Lighthouse** (Fase 5 liga no CI; aqui rodamos manual).
- **Commits frequentes** ao fim de cada task.

## File Structure (Fase 1)

```
robotersys-site/
├─ package.json                 # deps + scripts
├─ astro.config.mjs             # integrações, output static, vercel adapter
├─ tailwind.config.mjs          # plugin 3D portado + content globs
├─ tsconfig.json                # strict + paths (@/*)
├─ vitest.config.ts             # ambiente de teste
├─ .gitignore
├─ public/
│  └─ robotersys/               # poster do hero, logo (placeholders até assets reais)
├─ src/
│  ├─ styles/
│  │  ├─ global.css             # @tailwind + base (grid, vars, fontes)
│  │  └─ components.css         # PORTADO de docs/reference/.../components.css
│  ├─ i18n/
│  │  ├─ pt.ts                  # dicionário PT (fonte das strings)
│  │  ├─ types.ts               # tipo do dicionário
│  │  └─ index.ts               # helper t(locale, key) + getDictionary
│  ├─ lib/
│  │  └─ tailwind-3d-plugin.mjs # plugin de utilitários 3D (portado)
│  ├─ layouts/
│  │  └─ BaseLayout.astro       # html/head/grid/header/footer/slot
│  ├─ components/
│  │  ├─ SEOHead.astro          # meta/OG/title
│  │  ├─ SectionLabel.astro     # rótulo mono "// SEÇÃO"
│  │  ├─ Header.astro           # sticky + chip status + nav + CTA + menu mobile
│  │  ├─ Footer.astro           # rodapé técnico + contato + GPTW + disclaimer KUKA
│  │  ├─ Hero.astro             # poster-first + stat cards
│  │  ├─ ServiceCard.astro      # spotlight card
│  │  ├─ StatsBand.astro        # faixa de métricas
│  │  └─ Emergency24hCTA.astro  # bloco WhatsApp 24h
│  ├─ scripts/
│  │  ├─ reveal.ts              # IntersectionObserver → .sys-active
│  │  ├─ hero.ts                # spotlight + parallax (hover:hover)
│  │  └─ spotlight.ts           # flashlight nos spotlight-card
│  └─ pages/
│     └─ index.astro            # Home PT (montagem)
└─ tests/
   └─ i18n.test.ts              # TDD do helper t()
```

---

### Task 1: Scaffold do projeto Astro + dependências

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `astro.config.mjs`, `src/env.d.ts`

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "robotersys-site",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/tailwind": "^5.1.0",
    "@astrojs/vercel": "^8.0.0",
    "tailwindcss": "^3.4.17",
    "astro-icon": "^1.1.5",
    "@iconify-json/solar": "^1.2.0",
    "@fontsource-variable/inter": "^5.1.0",
    "@fontsource-variable/jetbrains-mono": "^5.1.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Instalar**

Run: `npm install`
Expected: instala sem erros; cria `node_modules/` e `package-lock.json`.

- [ ] **Step 3: Criar `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["astro/client"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "docs/reference"]
}
```

- [ ] **Step 4: Criar `.gitignore`**

```
node_modules/
dist/
.astro/
.vercel/
.output/
.env
.env.*
!.env.example
*.log
.DS_Store
.vscode/*
!.vscode/extensions.json
```

- [ ] **Step 5: Criar `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://robotersys.com',
  output: 'static',
  adapter: vercel({ imageService: false }),
  trailingSlash: 'always',
  integrations: [
    tailwind({ applyBaseStyles: false }), // base styles vêm do nosso global.css
    icon({ iconDir: 'src/icons' }),
  ],
  build: { inlineStylesheets: 'auto' },
});
```

- [ ] **Step 6: Criar `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 7: Verificar que o Astro inicializa**

Run: `npm run build`
Expected: build conclui (mesmo sem páginas além do default) sem erro de config. Se reclamar de "no pages", crie um `src/pages/index.astro` temporário com `<h1>ok</h1>` e rode de novo (será substituído na Task 11).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore astro.config.mjs src/env.d.ts
git commit -m "chore: scaffold Astro project (Tailwind v3, Vercel, astro-icon, Vitest)"
```

---

### Task 2: Tailwind config + plugin de utilitários 3D (portado)

**Files:**
- Create: `src/lib/tailwind-3d-plugin.mjs`, `tailwind.config.mjs`
- Reference: `docs/reference/design-system/assets/js/tailwind-config.js`

- [ ] **Step 1: Portar o plugin 3D** para `src/lib/tailwind-3d-plugin.mjs`

Copie a lógica do `addUtilities` da referência (rotate-x/y/z para os valores `[0,5,10,15,20,30,45,75]` + negativos, `perspective-*`, `transform-style-*`) como um plugin Tailwind ESM:

```js
import plugin from 'tailwindcss/plugin';

export default plugin(({ addUtilities }) => {
  const rotateValues = [0, 5, 10, 15, 20, 30, 45, 75];
  const tf = (varName, val) => ({
    [varName]: val,
    transform:
      'translate3d(var(--tw-translate-x,0),var(--tw-translate-y,0),var(--tw-translate-z,0)) ' +
      'rotateX(var(--tw-rotate-x,0)) rotateY(var(--tw-rotate-y,0)) rotateZ(var(--tw-rotate-z,0)) ' +
      'skewX(var(--tw-skew-x,0)) skewY(var(--tw-skew-y,0)) ' +
      'scaleX(var(--tw-scale-x,1)) scaleY(var(--tw-scale-y,1))',
  });
  const utils = {};
  for (const axis of ['x', 'y', 'z']) {
    for (const v of rotateValues) {
      utils[`.rotate-${axis}-${v}`] = tf(`--tw-rotate-${axis}`, `${v}deg`);
      if (v !== 0) utils[`.-rotate-${axis}-${v}`] = tf(`--tw-rotate-${axis}`, `-${v}deg`);
    }
  }
  addUtilities({
    ...utils,
    '.perspective-none': { perspective: 'none' },
    '.perspective-dramatic': { perspective: '100px' },
    '.perspective-near': { perspective: '300px' },
    '.perspective-normal': { perspective: '500px' },
    '.perspective-midrange': { perspective: '800px' },
    '.perspective-distant': { perspective: '1200px' },
    '.perspective-1000': { perspective: '1000px' },
    '.transform-style-preserve-3d': { 'transform-style': 'preserve-3d' },
    '.transform-style-flat': { 'transform-style': 'flat' },
  });
});
```

- [ ] **Step 2: Criar `tailwind.config.mjs`**

```js
import threeD from './src/lib/tailwind-3d-plugin.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // aliases semânticos (apontam para o Tailwind padrão da referência)
        ink: '#050505',      // fundo base
        surface: '#080808',  // superfície
        accent: '#ea580c',   // orange-600 (≈ laranja KUKA)
      },
    },
  },
  plugins: [threeD],
};
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: sem erro de Tailwind/plugin. (As utilities 3D só aparecem no CSS quando usadas.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/tailwind-3d-plugin.mjs tailwind.config.mjs
git commit -m "feat(design): port 3D transform utilities + tailwind theme aliases"
```

---

### Task 3: Estilos globais (fontes self-hosted + grid + `components.css` portado)

**Files:**
- Create: `src/styles/global.css`, `src/styles/components.css`
- Reference: `docs/reference/design-system/assets/css/components.css`

- [ ] **Step 1: Criar `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Fontes self-hosted (variable) */
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';

:root { --grid-line: #27272a; } /* zinc-800 */

html { background: #050505; scroll-behavior: smooth; }
body {
  font-family: theme('fontFamily.sans');
  color: #d4d4d8; /* zinc-300 — ajuste de contraste WCAG AA (era zinc-400/500) */
  -webkit-font-smoothing: antialiased;
}
.font-mono { font-family: theme('fontFamily.mono'); }

/* Grid de fundo (40px) */
.bg-grid {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

- [ ] **Step 2: Portar `components.css`** para `src/styles/components.css`

Copie **integralmente** `docs/reference/design-system/assets/css/components.css`, **removendo** a linha 1 `@import url("../df36dc074dcf1311_css2.css")` (as fontes agora vêm do `global.css`) e a regra `body { font-family... }`/`.font-mono` (já no global). Mantenha: `.bg-grid` (pode remover, duplicado), `spinSlow`, 3D card (`.preserve-3d`, `.backface-hidden`, `.rotate-y-180`, `.perspective-1000`, `.is-flipped`), `.spotlight-card` + `::before`, `.inner-sheen`, `border-glow`, `.sys-reveal`/`.sys-rise`/`.sys-slide-l`/`.sys-active`/delays (já em `prefers-reduced-motion: no-preference`), `#hero`/`.telemetry-card`/`.glitch-text`, `shimmer`, `scan-vertical`/`.animate-scan`. **Não** porte `.neural-cell` (descartado).

- [ ] **Step 3: Importar ambos no build** — adicione ao topo do `BaseLayout.astro` na Task 6 (`import '@/styles/global.css'; import '@/styles/components.css';`). Por ora só confirme que os arquivos existem.

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: sem erro de CSS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/styles/components.css
git commit -m "feat(design): self-hosted fonts, background grid, ported component CSS"
```

---

### Task 4: Ícones (Solar) + harness de testes (Vitest)

**Files:**
- Create: `vitest.config.ts`, `tests/smoke.test.ts`
- Note: `astro-icon` lê o set `@iconify-json/solar` automaticamente via `icon="solar:..."`.

- [ ] **Step 1: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
});
```

- [ ] **Step 2: Teste de fumaça (valida o harness)**

```ts
import { describe, it, expect } from 'vitest';
describe('harness', () => {
  it('roda', () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 3: Rodar**

Run: `npm test`
Expected: 1 teste PASS.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/smoke.test.ts
git commit -m "test: add Vitest harness"
```

---

### Task 5: Dicionário i18n PT + helper `t()` (TDD)

**Files:**
- Create: `src/i18n/types.ts`, `src/i18n/pt.ts`, `src/i18n/index.ts`, `tests/i18n.test.ts`

- [ ] **Step 1: Escrever o teste que falha** (`tests/i18n.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { t } from '@/i18n';

describe('t()', () => {
  it('resolve chave existente em PT', () => {
    expect(t('pt', 'nav.services')).toBe('Serviços');
  });
  it('chave ausente retorna a própria chave (sem quebrar render)', () => {
    expect(t('pt', 'nao.existe')).toBe('nao.existe');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL (`Cannot find module '@/i18n'`).

- [ ] **Step 3: Implementar** o dicionário e o helper

`src/i18n/types.ts`:
```ts
export type Locale = 'pt' | 'en' | 'es' | 'de';
export type Dict = Record<string, unknown>;
```

`src/i18n/pt.ts` (sementes; mais chaves entram conforme as páginas):
```ts
export default {
  nav: { services: 'Serviços', parts: 'Peças de Reposição', systems: 'Sistemas Robóticos',
         about: 'Sobre Nós', careers: 'Trabalhe Conosco', blog: 'Blog', contact: 'Entrar em contato' },
  header: { status: 'Suporte 24h: Ativo', cta: 'Entrar em contato' },
  hero: { kicker: 'Especialista independente em robôs KUKA',
          title: 'Soluções completas para Robôs KUKA',
          subtitle: 'Somos a maior especializada independente em robôs KUKA do Brasil.' },
} satisfies import('./types').Dict;
```

`src/i18n/index.ts`:
```ts
import type { Locale, Dict } from './types';
import pt from './pt';

const dicts: Partial<Record<Locale, Dict>> = { pt };

export function getDictionary(locale: Locale): Dict { return dicts[locale] ?? pt; }

export function t(locale: Locale, key: string): string {
  const dict = getDictionary(locale);
  const val = key.split('.').reduce<unknown>((acc, k) =>
    (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), dict);
  return typeof val === 'string' ? val : key;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: PASS (3 testes no total com o smoke).

- [ ] **Step 5: Commit**

```bash
git add src/i18n tests/i18n.test.ts
git commit -m "feat(i18n): PT dictionary + typed t() helper (TDD)"
```

---

### Task 6: BaseLayout + SEOHead

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/SEOHead.astro`

- [ ] **Step 1: `SEOHead.astro`**

```astro
---
interface Props { title: string; description: string; locale?: string; image?: string; }
const { title, description, locale = 'pt-BR', image = '/robotersys/og-default.jpg' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.site).href} />
<meta property="og:locale" content={locale} />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 2: `BaseLayout.astro`**

```astro
---
import '@/styles/global.css';
import '@/styles/components.css';
import SEOHead from '@/components/SEOHead.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
import type { Locale } from '@/i18n/types';
interface Props { title: string; description: string; locale?: Locale; }
const { title, description, locale = 'pt' } = Astro.props;
const htmlLang = { pt: 'pt-BR', en: 'en', es: 'es', de: 'de' }[locale];
---
<!doctype html>
<html lang={htmlLang} class="scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preload" as="font" type="font/woff2"
          href="/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2" crossorigin />
    <SEOHead title={title} description={description} locale={htmlLang} />
  </head>
  <body class="min-h-screen flex flex-col bg-ink text-zinc-300 selection:bg-accent selection:text-white">
    <div class="fixed inset-0 pointer-events-none z-0 opacity-[0.04] bg-grid"></div>
    <Header locale={locale} />
    <main class="relative z-10 flex-1"><slot /></main>
    <Footer locale={locale} />
  </body>
</html>
```

> Nota: o caminho de preload da fonte pode variar conforme a versão do fontsource; na Task 12 confirme o arquivo real em `node_modules/@fontsource-variable/inter/files/` e ajuste. Se preferir robustez, copie a woff2 para `public/fonts/` e referencie `/fonts/...`.

- [ ] **Step 3: Verificar** — depende de Header/Footer (Task 8). Após a Task 8, `npm run build` deve passar.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/SEOHead.astro
git commit -m "feat: BaseLayout + SEOHead"
```

---

### Task 7: SectionLabel + island de reveal

**Files:**
- Create: `src/components/SectionLabel.astro`, `src/scripts/reveal.ts`

- [ ] **Step 1: `SectionLabel.astro`** (rótulo mono "// SEÇÃO")

```astro
---
interface Props { text: string; }
const { text } = Astro.props;
---
<div class="text-[10px] font-mono text-accent uppercase tracking-widest flex items-center gap-2 mb-4">
  <span class="w-1.5 h-1.5 bg-accent animate-pulse"></span>
  // {text}
</div>
```

- [ ] **Step 2: `src/scripts/reveal.ts`** (IntersectionObserver → `.sys-active`)

```ts
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll<HTMLElement>('.sys-reveal');
if (reduce) {
  els.forEach((el) => el.classList.add('sys-active'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('sys-active'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach((el) => io.observe(el));
}
```

- [ ] **Step 3: Verificar build** após uso (Task 11). Sem teste unitário (DOM/visual).

- [ ] **Step 4: Commit**

```bash
git add src/components/SectionLabel.astro src/scripts/reveal.ts
git commit -m "feat: SectionLabel + scroll reveal island (reduced-motion aware)"
```

---

### Task 8: Header (+ menu mobile) + Footer

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`
- Reference: Header → `design-system.html` linhas 31–66; menu mobile 68–77; Footer 624–629. Dados de contato: §3 da spec.

- [ ] **Step 1: `Header.astro`** — porte a estrutura do header da referência (sticky, `h-16`, bordas zinc, chip de status verde com `animate-ping`), trocando:
  - logo/marca → **RoboterSys** (use `Icon name="solar:streets-navigation-linear"` ou o logo real quando vier; placeholder textual `ROBOTER<span class="text-zinc-600">SYS</span>`)
  - chip de status → `t('pt','header.status')` ("Suporte 24h: Ativo")
  - nav → itens reais: `nav.services/parts/systems/about/careers/blog` (links `/servicos/`, `/pecas-de-reposicao/`, `/sistemas-roboticos/`, `/sobre-nos/`, `/trabalhe-conosco/`, `/blog/`)
  - CTA → `header.cta` linkando `/contato/`
  - botão de menu mobile que alterna o painel (linhas 68–77) via `<script>` inline (toggle de classe `translate-x-full`).
  - **A11y:** textos de nav em `text-zinc-300` (não zinc-400), `aria-label` no botão, `focus-visible:ring`.

Use `import { Icon } from 'astro-icon/components'` para os ícones Solar.

- [ ] **Step 2: `Footer.astro`** — rodapé técnico (mono, `border-t border-zinc-800`, `bg-ink`) com:
  - colunas de links (nav repetida), contato (R. Parati 335C — Joinville/SC · contato.site@robotersys.com.br · (47) 4101 0987), redes (LinkedIn/Instagram/Facebook via ícones Solar)
  - selo **GPTW**, aviso "Independente da KUKA Roboter do Brasil; marca KUKA pertence à KUKA Roboter do Brasil", "© 2026 RoboterSys Serviços do Brasil Ltda".

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: passa (BaseLayout agora resolve Header/Footer).

- [ ] **Step 4: Inspeção visual**

Run: `npm run dev` → abrir `http://localhost:4321/` (precisa do index temporário). Conferir header sticky, chip pulsando, menu mobile abre/fecha < 768px.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat: Header (sticky + status chip + mobile menu) and Footer"
```

---

### Task 9: Hero (poster-first) + cards de telemetria/stats + island spotlight/parallax

**Files:**
- Create: `src/components/Hero.astro`, `src/scripts/hero.ts`
- Reference: hero `design-system.html` 103–186; lógica `interactions.js` 1–46.

- [ ] **Step 1: `Hero.astro`** — porte o hero, **trocando o vídeo autoplay por poster-first**:
  - Em vez de `<video autoplay>`, use `<img>` (poster leve em `public/robotersys/hero-poster.webp`, placeholder por ora) como camada de fundo (LCP).
  - Mantenha os gradientes de sobreposição, o kicker com dot verde, o `<h1>` (`hero.title`) e o parágrafo (`hero.subtitle`, com `border-l-2 border-accent`).
  - CTAs: "Entrar em contato" (`/contato/`) e "Ver serviços" (`/servicos/`).
  - Cards de telemetria (linhas 144–184) → **cards de stat** reaproveitados: "Robôs atendidos", "Intervenções", "Suporte 24h" (números placeholder até virem os reais).
  - Adicione `sys-reveal sys-rise` nos blocos e `data-depth` nos cards.
  - Inclua `<script>import '@/scripts/reveal.ts'</script>` e `<script>import '@/scripts/hero.ts'</script>` no fim do componente.

- [ ] **Step 2: `src/scripts/hero.ts`** — porte a interação (spotlight + parallax) de `interactions.js` 1–46, **mantendo o guard `matchMedia('(hover: hover)')`** e adicionando guard de `prefers-reduced-motion`. Selecione `#hero`, `#hero-spotlight`, `.telemetry-card`. (O poster substitui `#hero-bg-video`; aplique o parallax no poster `#hero-poster` em vez do vídeo.)

- [ ] **Step 3: Verificar build + visual**

Run: `npm run build` (passa) e `npm run dev` → hero renderiza; em desktop o spotlight segue o mouse; em mobile, estático.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/scripts/hero.ts
git commit -m "feat: poster-first Hero with stat cards + spotlight/parallax island"
```

---

### Task 10: ServiceCard + flashlight grid + StatsBand + Emergency24hCTA

**Files:**
- Create: `src/components/ServiceCard.astro`, `src/components/StatsBand.astro`, `src/components/Emergency24hCTA.astro`, `src/scripts/spotlight.ts`
- Reference: specs grid `design-system.html` 188–276; flashlight `interactions.js` 128–145.

- [ ] **Step 1: `ServiceCard.astro`**

```astro
---
import { Icon } from 'astro-icon/components';
interface Props { fig: string; icon: string; title: string; desc: string; }
const { fig, icon, title, desc } = Astro.props;
---
<div class="group relative border-zinc-800 border-r border-b min-h-[300px] flex flex-col bg-ink/50 card-item spotlight-card" style="--mouse-x:0px;--mouse-y:0px;">
  <div class="p-8 h-full flex flex-col relative z-10">
    <div class="flex justify-between items-start mb-6">
      <span class="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-1 group-hover:border-accent/50 group-hover:text-accent transition-all bg-ink">{fig}</span>
      <Icon name={icon} class="text-zinc-300 group-hover:text-white transition-colors" width={24} />
    </div>
    <h3 class="text-lg font-medium text-white uppercase tracking-tight mb-3 group-hover:text-accent transition-colors">{title}</h3>
    <p class="text-sm text-zinc-400 font-mono leading-relaxed">{desc}</p>
  </div>
</div>
```

> A11y: corpo em `text-zinc-400` (≥4.5:1) e ≥14px, não o `text-xs text-zinc-500` da referência.

- [ ] **Step 2: `src/scripts/spotlight.ts`** — porte `interactions.js` 128–145: para cada `.spotlight-grid`, no `mousemove`, setar `--mouse-x/--mouse-y` em cada `.spotlight-card`. Guard `hover:hover`.

- [ ] **Step 3: `StatsBand.astro`** — faixa "Nosso trabalho em números": grid de 4–5 stats (label mono + número grande branco), bordas zinc, fundo `surface`. Props: `stats: {label:string; value:string}[]`.

- [ ] **Step 4: `Emergency24hCTA.astro`** — bloco de emergência: headline + botão WhatsApp (`https://wa.me/55XXXXXXXXXXX` placeholder) com ícone, dot verde pulsando, estilo HUD.

- [ ] **Step 5: Verificar build + visual**

Run: `npm run build` e `npm run dev` → cards com borda spotlight no hover do grid (desktop).

- [ ] **Step 6: Commit**

```bash
git add src/components/ServiceCard.astro src/components/StatsBand.astro src/components/Emergency24hCTA.astro src/scripts/spotlight.ts
git commit -m "feat: ServiceCard (spotlight), StatsBand, Emergency24h CTA"
```

---

### Task 11: Montagem da Home PT (conteúdo real)

**Files:**
- Create/Replace: `src/pages/index.astro`

- [ ] **Step 1: Coletar a copy real da Home** — abra `https://robotersys.com/` (ou use a análise já feita) e capture os textos exatos: hero, os 6 serviços, descrição, métricas (se públicas), GPTW. Adicione as chaves novas em `src/i18n/pt.ts`.

- [ ] **Step 2: Montar `index.astro`**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import SectionLabel from '@/components/SectionLabel.astro';
import ServiceCard from '@/components/ServiceCard.astro';
import StatsBand from '@/components/StatsBand.astro';
import Emergency24hCTA from '@/components/Emergency24hCTA.astro';

const services = [
  { fig: 'FIG. 01', icon: 'solar:bolt-circle-linear', title: 'Corretiva e Emergências', desc: '...' },
  { fig: 'FIG. 02', icon: 'solar:shield-check-linear', title: 'Manutenção Preventiva', desc: '...' },
  { fig: 'FIG. 03', icon: 'solar:box-linear', title: 'Peças de Reposição', desc: '...' },
  { fig: 'FIG. 04', icon: 'solar:wrench-linear', title: 'Reparo de Peças', desc: '...' },
  { fig: 'FIG. 05', icon: 'solar:diploma-linear', title: 'Treinamento', desc: '...' },
  { fig: 'FIG. 06', icon: 'solar:settings-linear', title: 'Instalações e Programação', desc: '...' },
];
const stats = [
  { label: 'Clientes atendidos', value: '—' }, { label: 'Robôs atendidos', value: '—' },
  { label: 'Intervenções', value: '—' }, { label: 'Chamados de suporte', value: '—' },
];
---
<BaseLayout title="RoboterSys — Soluções completas para Robôs KUKA" description="A maior especializada independente em robôs KUKA do Brasil.">
  <Hero />
  <section class="border-b border-zinc-800 py-24 px-6 md:px-12">
    <SectionLabel text="Serviços" />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spotlight-grid">
      {services.map((s) => <ServiceCard {...s} />)}
    </div>
  </section>
  <StatsBand stats={stats} />
  <Emergency24hCTA />
  <script>import '@/scripts/spotlight.ts';</script>
</BaseLayout>
```

> Preencha os `desc` e `value` com a copy/numbers reais coletados no Step 1 (sem deixar `...`/`—`). Reaproveite as descrições da análise da Home.

- [ ] **Step 3: Verificar build + visual completo**

Run: `npm run build` (sem erros) e `npm run preview` → Home renderiza com hero, 6 serviços (spotlight no hover), métricas, CTA 24h, header/footer.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/i18n/pt.ts
git commit -m "feat: assemble PT Home page with real content"
```

---

### Task 12: Verificação final (build, Lighthouse, preview) + housekeeping

**Files:** nenhum novo (ajustes pontuais)

- [ ] **Step 1: Build de produção limpo**

Run: `npm run build`
Expected: 0 erros, 0 warnings de acessibilidade óbvios. Confirmar que o `dist/` tem `index.html` estático.

- [ ] **Step 2: Lighthouse local** (proxy do orçamento da Fase 5)

Run: `npm run preview` e em outra aba rode Lighthouse (Chrome DevTools, mobile) na home.
Expected: **Performance ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95**. Se Performance < 95, investigar: tamanho do poster do hero (recomprimir), preload de fonte correto, JS das islands.

- [ ] **Step 3: Checar contraste** — confirmar que textos de corpo usam `zinc-300/400` (não `zinc-500/600`) e que rótulos mono com conteúdo têm ≥ 12–14px.

- [ ] **Step 4: Confirmar caminho real da fonte de preload** em `node_modules/@fontsource-variable/inter/files/` e corrigir o `<link rel=preload>` do BaseLayout (ou migrar para `public/fonts/`).

- [ ] **Step 5: Commit final da fase**

```bash
git add -A
git commit -m "chore(phase-1): finalize foundation + design system (PT Home)"
```

---

## Self-Review (preenchido)

**Cobertura vs spec (Fase 1):** stack (T1–T2 ✓), tokens/Tailwind padrão + plugin 3D (T2 ✓), fontes self-hosted + grid + components.css (T3 ✓), ícones Solar inline (T4 ✓), i18n dictionary pattern (T5 ✓), BaseLayout/SEOHead (T6 ✓), reveal + reduced-motion (T7 ✓), Header/Footer + menu mobile (T8 ✓), Hero poster-first + spotlight/parallax (T9 ✓), ServiceCard/spotlight/StatsBand/Emergency (T10 ✓), Home PT (T11 ✓), performance/a11y check (T12 ✓). **Fora desta fase (planos seguintes):** demais páginas PT + formulários (Fase 2), i18n EN/ES/DE (Fase 3), blog/Keystatic (Fase 4), GTM/consent/SEO/redirects/deploy (Fase 5).

**Placeholders:** os `...`/`—` em T10/T11 são marcados explicitamente para preenchimento com copy/numbers reais no mesmo passo (não são entregáveis com reticências). Demais passos têm código/comandos concretos.

**Consistência de tipos:** `Locale`/`Dict` (T5) reusados em BaseLayout (T6); `t()` assinatura `(locale, key)` consistente; classes CSS portadas (`.spotlight-card`, `.sys-reveal`, `.telemetry-card`) batem entre `components.css` (T3) e os componentes/scripts (T7–T11).
