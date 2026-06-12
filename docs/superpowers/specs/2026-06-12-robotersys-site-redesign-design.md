# RoboterSys — Novo Site (Réplica re-estilizada, multilíngue, alta performance)

- **Data:** 2026-06-12
- **Autor:** CREATED (Edgar) + Claude
- **Status:** Spec para revisão
- **Cliente:** RoboterSys Serviços do Brasil Ltda — maior especializada independente em robôs **KUKA** do Brasil (Joinville/SC)
- **Repositório:** `projetos-created/robotersys-site` (greenfield)

---

## 1. Contexto e objetivo

A RoboterSys tem um site WordPress em produção (`robotersys.com`) com um **site completo em PT** e duas variações **parciais** em EN (foco EUA) e ES (foco LATAM). O objetivo é **reconstruir o site do zero**, replicando fielmente o conteúdo/estrutura atual, porém:

1. Aplicando um **novo design system** de referência — estética "HUD industrial / centro de comando" (dark, laranja-neon, tipografia técnica), entregue como export do aura.build (`autonomous-drone-62`).
2. Tornando-o **multilíngue completo**: **PT, EN, ES, DE** (alemão é novo), com **paridade total** entre idiomas no lançamento.
3. Com **performance excepcional** (o site será destino de **tráfego pago no Google Ads**).
4. Totalmente **responsivo** e acessível.

> **Insight de marca:** o acento laranja do design system (`#EA580C`) é praticamente o laranja da KUKA, e a linguagem de telemetria/precisão casa naturalmente com robótica industrial. Além disso, **KUKA é uma empresa alemã** — o idioma DE reforça a autoridade da marca no mercado de origem.

## 2. Objetivos de sucesso (mensuráveis)

| Métrica | Alvo |
|---|---|
| Lighthouse mobile — Performance | ≥ 95 |
| Lighthouse — SEO / Best Practices / A11y | ≥ 95 |
| LCP (4G, mobile mediano) | < 1,8s |
| CLS | < 0,1 |
| INP | < 200ms |
| JS inicial na landing (gzip) | < ~50KB |
| TTFB (estático + edge cache Vercel) | < 200ms |
| Cobertura de idiomas | 4 idiomas, **todas** as páginas |
| Prontidão p/ Ads | GA4 + conversões Ads disparando pós-consentimento; páginas de Privacidade/Cookies no ar; Consent Mode v2 |

## 3. Análise do site atual

**Plataforma:** WordPress (URLs com `/categoria/`, trailing slash, "Developed by CREATED").

**Estrutura por idioma:**
- **PT (`/`)** — site completo. É a fonte de verdade do conteúdo.
- **EN (`/remote-support-usa/`)** — site reduzido, foco **EUA** (endereço Ocoee/FL, "powering American industry"), centrado em **suporte remoto**. Nav: Remote Support · PushCorp · About Us · Blog.
- **ES (`/remote-support-latam/`)** — site reduzido, foco **LATAM**, com os 6 serviços, métricas, depoimentos, form. Nav: Home · PushCorp · Contacto.
- **Blog** — `/category/pt/` (posts PT); existem artigos em EN em outra taxonomia (a mapear na implementação).

**Contatos conhecidos:** R. Parati, 335C — Joinville/SC · contato.site@robotersys.com.br · (47) 4101 0987 · RH: rh@robotersys.com.br · US: Ocoee/FL · Redes: LinkedIn, Instagram, Facebook · Suporte 24h via grupo de WhatsApp.

**Componentes recorrentes:** form "Vamos construir juntos!" (Nome, Email, WhatsApp, Mensagem) e CTA "Fale com a gente!" (WhatsApp 24h + QR) repetidos em quase todas as páginas; faixa de métricas; selo GPTW; aviso de independência da KUKA no rodapé.

## 4. Decisões do briefing

| Tema | Decisão |
|---|---|
| Stack | **Astro + Tailwind + TypeScript**, deploy na **Vercel** |
| Conteúdo | **Réplica fiel**, apenas re-estilizada com o novo design system |
| Idiomas | PT/EN/ES/DE, **paridade total no lançamento** |
| Tradução | Traduzir o site PT → EN/ES/DE, **reaproveitando** o conteúdo EN/ES existente; DE para revisão profissional |
| Posicionamento | **Híbrido**: base única traduzida + **blocos regionais** (contato/indústrias por mercado; EN mantém ângulo EUA; DE fala com DACH) |
| Blog/CMS | **Keystatic** (Git/MDX no repo) + **conta GitHub editorial compartilhada**; imagens no repo |
| Formulários | `/api/contact` → e-mail (**Resend**) + cadastro no **Ploomes** (API). E-mail é a cópia durável; se o Ploomes falhar, a notificação sinaliza |
| Medição | **GA4 + Google Ads + GTM** com **Consent Mode v2** + banner de cookies (LGPD/GDPR) |
| Deploy | **Vercel** com preview (`novo.robotersys.com`) → cutover para `robotersys.com` |
| Hero | **Poster-first**: imagem leve é o LCP; vídeo (comprimido) entra após o 1º paint, respeitando `reduced-motion` |
| Acessibilidade | Ajustar contraste/tamanhos para **WCAG AA**, mantendo a estética |
| Páginas novas | **Política de Privacidade** e **Política de Cookies** |

## 5. Stack e arquitetura

- **Astro** em modo `hybrid` (Vercel adapter): páginas públicas **pré-renderizadas (SSG)**; apenas o endpoint do formulário e o painel do Keystatic rodam como **funções serverless**.
- **Tailwind CSS** — tokens são o **Tailwind padrão** (zinc / orange-600 / green-500; o `theme.extend` do design de referência está **vazio**, sem tema custom). Portamos o **plugin de utilitários 3D** (`rotate-x/y/z`, `perspective-*`, `transform-style-*`) e o **`components.css`** (keyframes `shimmer`, `scan-vertical`, `border-glow`, `spinSlow`; spotlight, flip 3D, reveals).
- **TypeScript** em toda a base.
- **Astro Islands** para interatividade pontual (sem framework SPA): menu mobile, seletor de idioma, configurador, abas de casos de uso, banner de cookies, formulários. Preferir **vanilla/`<script>`** ou ilhas leves; evitar hidratar o que for estático.
- **Iconify (Solar set)** para ícones — via build (sprite/SVG inline), **não** via runtime CDN, para não pesar.
- **Conteúdo**: Astro Content Collections (blog em MDX, gerido pelo Keystatic) + dicionários i18n em JSON/TS.

## 6. Arquitetura de informação

**Sitemap (por idioma, paridade total):** Home · Serviços · Peças de Reposição · Sistemas Robóticos · PushCorp (Integrador Parceiro) · Sobre Nós · Trabalhe Conosco · Blog (índice + posts) · Contato · Política de Privacidade · Política de Cookies · 404.

**Outline por página (a replicar, re-estilizado):**

- **Home** — Hero "Soluções completas para Robôs KUKA" → 6 serviços → clientes (logos) → Suporte 24h (WhatsApp/QR) → descrição da empresa → GPTW (4 anos) → métricas ("nosso trabalho em números") → blog (3 últimos) → form "Vamos construir juntos!".
- **Serviços** — posicionamento + cards de serviços (Instalação/Programação, Alterações/Otimizações, Manutenção Prev./Corretiva, Reparo de Peças, Peças de Reposição, Simulações) + Suporte Técnico + form + WhatsApp.
- **Peças de Reposição** — "Maior estoque de peças KUKA do sul do Brasil" + robôs usados KUKA + **grid de 17 categorias** (KCP1/KCP2, membranas, placas MFC1/2/3, motores, cabos, baterias, correias, óleos…) + 4 diferenciais (Amplo estoque, Peças testadas, Entrega express, Suporte ágil) + form.
- **Sistemas Robóticos** — células turn-key/semi-turn-key + aplicações (paletização, handling, rebarbação, retrofit) + galeria de células (com "Saiba mais") + clientes + blog + form.
- **PushCorp** — parceria de integrador (remoção de material desde 1993, fabricação US, lab no Texas) + aplicações da célula de rebarbação + tecnologia compliance device (força controlada, compensação, versatilidade) + diferenciais + form de consulta de produto + blog.
- **Sobre Nós** — empresa desde 2006 + história (origem em intercâmbio técnico em Berlim) + Missão + Visão + Valores (Agilidade, Competitividade, Confiabilidade) + métricas + GPTW + form.
- **Trabalhe Conosco** — cultura (Inovação, Crescimento, Colaboração) + GPTW 4 anos + **form de candidatura** (Nome, Email, WhatsApp, Mensagem) + rh@robotersys.com.br.
- **Blog** — índice com cards (filtrável por idioma) + página de post (MDX, conteúdo relacionado, CTA).
- **Contato** — form + canais (WhatsApp 24h, telefone, e-mail, endereço, mapa) + horários. *(Hoje o "/suporte" é só um link de grupo de WhatsApp; criamos uma página real de contato e mantemos o CTA do grupo.)*

## 7. Internacionalização (i18n)

- **Roteamento:** **PT na raiz** (`/servicos/`), demais idiomas com prefixo (`/en/…`, `/es/…`, `/de/…`) — `prefixDefaultLocale: false`. Isso **preserva o SEO das URLs PT já indexadas**.
- **Slugs localizados** por idioma (ex.: `/en/services`, `/es/servicios`, `/de/leistungen`) — melhor SEO/UX. Mapa de slugs definido na fase de tradução.
- **`trailingSlash: 'always'`** para casar com as URLs atuais do WordPress e minimizar redirects.
- **`hreflang`** recíproco + `x-default` (PT) em todas as páginas; **sitemap** por idioma.
- **Strings de UI** em dicionários (`src/i18n/{pt,en,es,de}.ts`); **conteúdo de página** em componentes/coleções por idioma.
- **Posicionamento híbrido:** base traduzida igual para todos + **overrides regionais** num config por locale: bloco de **contato** (PT→Joinville/BR; EN→Ocoee/FL; ES→contato LATAM; DE→contato DACH *(a definir)*), **indústrias-foco** e, opcionalmente, sub-headline do hero.
- **Fonte das traduções:** PT é a base; reaproveitar copy EN/ES existente onde encaixa; **DE gerado e marcado para revisão profissional**. Toda tradução automática fica sinalizada para revisão do cliente antes do go-live.
- **Seletor de idioma** no header (mantém a página equivalente no idioma destino).

## 8. Sistema de design e mapeamento visual

**Tokens (Tailwind theme):**
- **Cores:** base `#050505`; superfície `#080808`; bordas `zinc-800` (#27272a) e `zinc-800/50`; texto título `white`; **texto corpo `zinc-300/400`** (ajustado de zinc-500/600 por contraste); **acento `orange-600`** (#EA580C) / hover `orange-500`; status `green-500` / alerta `red-500`.
- **Tipografia:** **Inter** (display/corpo, uppercase + tracking-tight nos títulos, `font-medium`, escala grande) + **JetBrains Mono** (labels técnicos `// SEÇÃO`, "FIG. 0X", uppercase tracking-widest). **Self-hosted** (woff2, subset, `font-display: swap`, preload).
- **Layout "blueprint":** seções moduladas por bordas finas zinc, grid de fundo a ~3%, labels mono, numeração de seção.
- **Efeitos (gated por `prefers-reduced-motion`):** spotlight cards (gradiente radial no mouse), parallax de cards, flip 3D, glitch text on-load, scan-lines/shimmer, glows, vídeo de fundo `mix-blend-screen`.

**Mapeamento design system → RoboterSys:**

| Referência (AERO_SYS) | RoboterSys |
|---|---|
| Header c/ chip de status + "Solicitar Unidade" | Header c/ chip **"Suporte 24h: Ativo"** + seletor de idioma + **Entrar em contato** / WhatsApp |
| Hero c/ vídeo + cards de telemetria | Hero **"Soluções completas para Robôs KUKA"** + cards de **stats** (robôs atendidos, intervenções, 24h) |
| Specs grid (FIG.01–04) | **6 serviços** em spotlight-cards |
| Configurador (flip cards 3D) | **"Qual sua necessidade?"** — seletor que recomenda o serviço/solução |
| Vision (sensor duplo/térmico) | **Diagnóstico de precisão / Peças & Reparo** |
| Missions (abas de casos de uso) | **Segmentos/aplicações** (paletização, handling, rebarbação, retrofit) |
| Rodapé técnico mono | Rodapé c/ contato, redes, GPTW, aviso de independência da KUKA |

**Componentes a construir:** `Header`, `Footer`, `LanguageSwitcher`, `Hero` (poster-first), `SectionLabel`, `ServiceCard` (spotlight), `StatsBand`, `Configurator`, `UseCaseTabs`, `ClientLogos`, `CertificationBadge` (GPTW), `Emergency24hCTA`, `PartsGrid`, `CellGallery`, `BlogCard`, `ContactForm`, `CareersForm`, `ProductInquiryForm`, `CookieBanner`, `Breadcrumbs`, `SEOHead`.

**Interações (confirmadas no `interactions.js`) → islands, desktop/`hover:hover`, com `prefers-reduced-motion`:** hero spotlight + parallax dos cards; "flashlight" nos spotlight-cards (serviços); tilt 3D + flip nos cards do seletor; glitch/decode em uma palavra do título; tab switcher (segmentos); reveals via IntersectionObserver (`.sys-reveal` → `.sys-active`); lógica de recomendação do seletor. **Descartar por custo/baixo valor:** neural grid (200 nós) e exploded view (decorativos/sem uso real).

**Acessibilidade do tema:** contraste de corpo ≥ 4.5:1; tamanho mínimo de texto com conteúdo ≈ 14–16px (mono decorativo pode ser menor); foco visível; alvos de toque ≥ 44px.

## 9. Blog e CMS (Keystatic)

- **Storage:** `github` (conteúdo como **MDX no repo**), login pela **conta GitHub editorial** compartilhada da RoboterSys. Painel em **`/keystatic`** (`noindex`, fora dos idiomas).
- **Coleção `posts`** (por idioma — pastas `src/content/blog/{pt,en,es,de}/`): campos `title`, `slug`, `language`, `excerpt`, `coverImage`, `category`, `author`, `publishedAt`, `seo` (title/description/og), `body` (MDX), opcional `translationOf` (liga versões).
- **Categorias** (ex.: Paletização, Manutenção, Rebarbação, Suporte Remoto, Segurança) como coleção/enum.
- **Imagens:** commitadas no repo (volume modesto), otimizadas no build via `astro:assets`.
- **Fluxo:** cliente edita → **Salvar = commit** → Vercel **rebuilda automaticamente** (sem webhook) → post no ar (~1–2 min). Site segue 100% estático.
- **Migração:** importar os 12+ posts PT atuais e os artigos EN existentes para MDX (preservando slugs quando possível → redirects).

## 10. Formulários e integrações

**Endpoint único** `POST /api/contact` (função serverless, com `type`: contato | carreiras | produto):
1. **Valida** (Zod) + **anti-spam**: honeypot + rate-limit por IP + verificação (BotID/Turnstile) — essencial por causa do tráfego pago.
2. **Resend** — e-mail de notificação para a RoboterSys (destinatário conforme `type`: contato → comercial; carreiras → rh@; produto → comercial/PushCorp). **Este e-mail é a cópia durável de cada lead.**
3. **Ploomes** — cria Contato/Negócio via API (mapear campos Nome/Email/WhatsApp/Mensagem + origem/idioma/UTMs).
4. **Tolerância a falha:** se o Ploomes falhar, registra nos logs da função **e sinaliza no próprio e-mail de notificação** (marcador no assunto/corpo) para o time garantir o cadastro manual. O usuário não é penalizado (sucesso desde que o e-mail saia).
5. Resposta JSON → UI mostra sucesso/erro; dispara evento de conversão (pós-consentimento).

- **Captura de UTMs** e `gclid` (Google Ads) em campos ocultos → enviados ao **Ploomes** para atribuição.
- **WhatsApp**: botão click-to-chat (número 24h) + manter o grupo de suporte como CTA secundário.
- **Formulários distintos** reusando o endpoint: Contato, Candidatura (Trabalhe Conosco), Consulta de Produto (PushCorp).

## 11. Medição, tags e consentimento

- **Google Tag Manager** como contêiner único; dentro dele: **GA4** + **Google Ads** (conversões: envio de form, clique WhatsApp, clique telefone).
- **Consent Mode v2**: estado **default = denied** (analytics/ads) até consentimento; `update` ao aceitar.
- **Banner de cookies** próprio e leve (LGPD + GDPR): aceitar/rejeitar/preferências, persistência, re-abertura via link no rodapé. Bloqueia tags não-essenciais até o consentimento.
- **Carregamento**: GTM injetado de forma adiada (pós-interação/idle) para não impactar LCP/INP.
- **Eventos**: `generate_lead`, `whatsapp_click`, `phone_click`, `form_start`, `language_switch`, view de blog.

## 12. Performance

**Estratégia (o diferencial do projeto):**
- **SSG** + edge cache da Vercel; assets imutáveis com hash; Brotli.
- **JS mínimo**: só ilhas necessárias; resto é HTML/CSS. Sem framework de runtime pesado.
- **Hero poster-first**: imagem (AVIF/WebP) é o LCP; o vídeo (recodificado e **muito** mais leve que os 11MB do export) entra **após o 1º paint**, `preload="none"`, pausa em `reduced-motion`/`save-data`.
- **Imagens** via `astro:assets`: AVIF/WebP, `srcset` responsivo, `loading="lazy"` abaixo da dobra, **dimensões explícitas** (zero CLS).
- **Fontes** self-hosted + subset + preload das críticas.
- **Ícones** Solar inline no build (sem runtime Iconify).
- **CSS** Tailwind purgado; crítico inline; resto adiado.
- **Terceiros** (GTM) adiados e pós-consentimento.
- **Budget no CI**: Lighthouse CI com orçamento (Perf ≥ 95) bloqueando regressões.

## 13. Acessibilidade e responsividade

- **Mobile-first**, breakpoints Tailwind (sm/md/lg/xl); testar 360px → 1440px+.
- **WCAG AA**: contraste, foco visível, navegação por teclado, `aria-*` em menu/abas/seletor/forms, `alt` em imagens, `prefers-reduced-motion` desliga animações intensas.
- **Formulários** com labels associados, mensagens de erro acessíveis, estados de loading.
- **Semântica** correta (landmarks, headings hierárquicos, `lang` por página).

## 14. SEO e migração

- **Meta** por página/idioma (title/description/OG/Twitter) via `SEOHead`.
- **`hreflang`** recíproco + `x-default`; **sitemap** multilíngue; `robots.txt`.
- **Structured data (JSON-LD):** `Organization` + `LocalBusiness` (Joinville + Ocoee/FL), `BreadcrumbList`, `BlogPosting` nos posts, `FAQPage` onde houver.
- **Redirects 301 (old → new):**

| De (atual) | Para (novo) |
|---|---|
| `/remote-support-usa/` | `/en/` |
| `/remote-support-latam/` | `/es/` |
| `/category/pt/` | `/blog/` |
| URLs de posts antigos | slug equivalente no novo blog |
| `/suporte` | grupo de WhatsApp (preservar) ou `/contato` |

> URLs PT internas (`/servicos/`, `/pecas-de-reposicao/`, …) são **preservadas** (raiz + trailing slash) → sem perda de ranking.

## 15. Estrutura do projeto

```
robotersys-site/
├─ astro.config.mjs            # i18n, vercel adapter, integrações
├─ keystatic.config.ts         # coleções do blog (github storage)
├─ tailwind.config.ts          # tokens + utilitários 3D
├─ src/
│  ├─ components/              # Header, Footer, Hero, ServiceCard, ...
│  ├─ layouts/                 # BaseLayout, PageLayout, BlogLayout
│  ├─ pages/                   # PT na raiz; en/ es/ de/ prefixados
│  │  ├─ index.astro           # Home PT
│  │  ├─ servicos/ ...         # demais páginas PT
│  │  ├─ [lang]/ ...           # EN/ES/DE
│  │  ├─ keystatic/[...].ts    # painel CMS
│  │  └─ api/contact.ts        # endpoint de formulários
│  ├─ content/blog/{pt,en,es,de}/   # posts MDX (Keystatic)
│  ├─ i18n/                    # dicionários + config de locale/regional
│  ├─ lib/                     # resend, ploomes, validação
│  ├─ styles/                  # base + components.css (animações)
│  └─ assets/                  # imagens, fontes, vídeo otimizado
└─ docs/superpowers/specs/     # este documento
```

## 16. Plano de deploy e virada

1. Projeto na **Vercel** ligado ao repo; **preview deploy** a cada push.
2. **Staging** em `novo.robotersys.com` (ou preview URL) para validação do cliente (conteúdo + traduções).
3. Configurar **env vars** (Resend, Ploomes, GA4/Ads/GTM) por ambiente.
4. Revisão de traduções (especialmente **DE**) + QA (Lighthouse, a11y, formulários ponta-a-ponta, redirects).
5. **Cutover**: apontar `robotersys.com` para a Vercel + ativar **301s**; manter monitoramento (Search Console, GA4, logs de form).

## 17. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Vídeo do hero pesar no LCP | Poster-first; vídeo recodificado/lazy; fallback estático |
| Tradução DE sem revisão nativa | Marcar como rascunho; gate de revisão antes do go-live |
| Spam no form (tráfego pago) | Honeypot + rate-limit + BotID/Turnstile |
| Perder lead se o Ploomes cair | E-mail (Resend) é a cópia durável; falha do Ploomes sinalizada no e-mail + logs |
| Login GitHub confundir o cliente | Conta editorial dedicada + mini-guia de publicação |
| Quebra de SEO na migração | Preservar URLs PT + 301s + sitemap/hreflang + Search Console |
| Contraste do tema reprovar A11y/Ads | Ajuste AA já previsto nos tokens |

## 18. Fora de escopo (v1)

- E-commerce/checkout de peças (apenas catálogo + lead).
- Área logada / portal do cliente.
- Vagas dinâmicas (carreiras é form geral, como hoje).
- Migração de comentários do blog.
- App nativo.

## 19. Itens em aberto e credenciais necessárias

- **Credenciais:** API key **Ploomes** (+ mapeamento de campos/funil), domínio verificado no **Resend**, IDs **GA4 / Google Ads (conversões) / GTM**, **conta GitHub editorial**, acesso ao projeto **Vercel** e ao **DNS** do domínio.
- **Assets de marca:** logo RoboterSys (SVG), logos de clientes, fotos/vídeo reais de robôs/células, paleta/uso da marca se houver.
- **Conteúdo regional:** contato/endereço **DACH** para o DE; confirmar se EN mantém endereço Ocoee/FL e telefone US.
- **Decisão fina:** manter `/suporte` apontando ao grupo de WhatsApp ou levar para `/contato`.

## 20. Checklist de coleta de conteúdo (na implementação)

- [ ] Copy exata, página a página, do site PT (headings, parágrafos, listas, métricas reais).
- [ ] Copy EN existente (`/remote-support-usa/`) e ES (`/remote-support-latam/`) para reaproveitar.
- [ ] Posts do blog (PT + EN) → MDX, com imagens e slugs.
- [ ] Logos de clientes e imagens de células/peças.
- [ ] Números reais da faixa de métricas e selos (GPTW).
- [ ] Mapa de slugs localizados (PT/EN/ES/DE) por página.
