# Fase 5 — Medição + SEO + Performance + Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Deixar o site pronto para **tráfego pago e produção**: consentimento LGPD/GDPR + **GTM/GA4/Google Ads** (Consent Mode v2), **JSON-LD/SEO**, **redirects 301** (URLs antigas do WordPress, incl. blog), **performance/Lighthouse** e **headers de segurança**, e a **preparação de deploy na Vercel**.

**Architecture:** Medição **consent-first**: nada de analytics/ads carrega antes do consentimento (Consent Mode v2 `default: denied`). Tudo cabeado por **env vars** (IDs do GTM/GA4/Ads) — o build não depende dos IDs; ativa quando você os adicionar. SEO via JSON-LD + meta já existentes. Redirects e headers via **`vercel.json`** (ou `vercel.ts`). Performance: o site já é estático/enxuto; validar com Lighthouse e afinar. Deploy: o adapter Vercel já está configurado — falta o `vercel.json`, os env vars e o cutover (passo seu/assistido).

**Dependência (não bloqueia o build):** IDs reais de **GTM / GA4 / Google Ads**, conta **Vercel** + **DNS** do domínio. Documentar em `.env.example`.

## Arquitetura

**Consentimento + medição:**
- Banner de cookies próprio e leve (`CookieConsent.astro` + script) — aceitar / recusar / preferências (essenciais sempre on; analytics/marketing opt-in). Persiste em `localStorage`/cookie; link "Cookies" no rodapé reabre.
- **Consent Mode v2** default `denied` (ad_storage, analytics_storage, ad_user_data, ad_personalization) — set ANTES do GTM. Ao aceitar → `gtag('consent','update', granted)`.
- **GTM** como contêiner (carregado **após interação/idle**, não bloqueia LCP); dentro dele GA4 + Google Ads (conversões: envio de form, clique WhatsApp, clique telefone). IDs via env (`PUBLIC_GTM_ID`, `PUBLIC_GA4_ID`, `PUBLIC_ADS_ID`). Se sem ID → não injeta nada (no-op).
- Eventos via `dataLayer.push`: `generate_lead` (form ok no `/api/contact`), `whatsapp_click`, `phone_click`, `language_switch`.

**SEO/JSON-LD:**
- `Organization` + `LocalBusiness` (Joinville/SC + Ocoee/FL no EN) no `BaseLayout`/home; `BreadcrumbList` (já no Breadcrumbs); `BlogPosting` (já nos posts); `WebSite` + `SearchAction` opcional; `FAQPage` onde houver.
- Confirmar: `hreflang` recíproco + `x-default`, `<link rel=canonical>`, OG/Twitter por idioma, sitemap multilíngue, `robots.txt` (libera tudo menos `/keystatic` e `/api`).

**Redirects 301 (`vercel.json`):** mapa antigo→novo — `/remote-support-usa/`→`/en/`, `/remote-support-latam/`→`/es/`, `/category/pt/`→`/blog/`, e os **slugs antigos de posts** (de `docs/reference/blog-redirects.md`) → `/blog/<slug>/`. URLs PT internas preservadas (raiz + trailing slash).

**Headers de segurança (`vercel.json`):** `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`, e um **CSP** compatível com GTM/GA/YouTube-nocookie/Ploomes/Resend (cuidado p/ não quebrar o GTM).

---

## M1 — Consentimento + GTM/GA4/Ads (Consent Mode v2, env-wired)
**Files:** `src/components/CookieConsent.astro`, `src/scripts/consent.ts`, `src/components/Analytics.astro` (GTM + consent default), `BaseLayout.astro`, `.env.example`, i18n `consent.*`
- [ ] `Analytics.astro` no `<head>`: define `dataLayer` + `gtag('consent','default', {denied...})` (Consent Mode v2) ANTES de qualquer tag; injeta o GTM **só se** `import.meta.env.PUBLIC_GTM_ID` existir, **após** `requestIdleCallback`/primeira interação. No-op sem ID.
- [ ] `CookieConsent.astro` + `consent.ts`: banner (aceitar/recusar/preferências), persiste escolha, no aceite faz `gtag('consent','update', granted)` + dispara o carregamento do GTM; link no rodapé reabre. i18n `consent.*` (4 idiomas, LGPD+GDPR). A11y (foco, teclado, role=dialog).
- [ ] Eventos: `whatsapp_click`/`phone_click` (nos componentes), `generate_lead` (no sucesso do ContactForm), `language_switch` (no LanguageSwitcher) via `dataLayer.push` (no-op sem GTM).
- [ ] `.env.example`: `PUBLIC_GTM_ID=`, `PUBLIC_GA4_ID=`, `PUBLIC_ADS_ID=`, `PUBLIC_ADS_CONVERSION_LABEL=`.
- [ ] Verificar: sem IDs → nenhum script de analytics no HTML; banner aparece; build/check/test verdes. Commit.

## M2 — Structured data (JSON-LD) + SEO finalize
**Files:** `src/components/JsonLd.astro` (ou no SEOHead), `BaseLayout`, home
- [ ] `Organization`+`LocalBusiness` JSON-LD (nome, logo, endereço Joinville; no EN, Ocoee/FL; telefone/email/redes — placeholders onde faltam). `WebSite`. Confirmar `BreadcrumbList`/`BlogPosting`.
- [ ] Auditar `canonical`, OG/Twitter por idioma, `hreflang`+`x-default`, sitemap (incl. blog), `robots.txt` (Disallow `/keystatic` `/api`; Allow resto; `Sitemap:` URL).
- [ ] Verificar (Rich Results-friendly): build + grep do JSON-LD nas páginas. Commit.

## M3 — Redirects 301 + headers + performance
**Files:** `vercel.json` (ou `vercel.ts`)
- [ ] `vercel.json` com **redirects 301**: `/remote-support-usa/`→`/en/`, `/remote-support-latam/`→`/es/`, `/category/pt/`→`/blog/`, + os posts de `docs/reference/blog-redirects.md` (antigo→`/blog/<slug>/`). 
- [ ] **Security headers** (HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy, CSP compatível com GTM/GA/youtube-nocookie/Ploomes/Resend). 
- [ ] **Performance pass:** rodar Lighthouse (preview na main) — alvo Perf/SEO/A11y/Best-Practices ≥ 95; afinar o que faltar (imagens/preload/JS). Confirmar que o GTM/consent não derruba o LCP. Documentar a nota.
- [ ] Verificar build + os redirects no `vercel.json` válidos. Commit.

## M4 — Deploy prep + runbook + revisão final
- [ ] `vercel.json`/config final; `.env.example` completo; documentar em `docs/reference/deploy-runbook.md` o passo-a-passo: criar projeto Vercel, ligar o repo, adicionar env vars (Resend/Ploomes/GTM/GA4/Ads/Keystatic GitHub App), preview em `novo.robotersys.com`, validar (form, consent, idiomas, redirects), cutover do `robotersys.com` + DNS, e o pós-deploy (Search Console, GA4).
- [ ] `astro check`/`build`/`test` verdes; revisão final independente de toda a Fase 5. Corrigir achados. Commit. (O deploy ao vivo é seu/assistido — posso ajudar via Vercel quando você autenticar.)

## Self-Review (preenchido)
- **Cobertura:** consentimento + Consent Mode v2 + GTM/GA4/Ads (M1), JSON-LD/SEO (M2), redirects+headers+perf (M3), deploy prep+runbook+revisão (M4). Tudo cabeado por env — build não depende dos IDs.
- **Riscos:** CSP pode quebrar GTM/GA/YouTube se mal configurado — testar; o deploy ao vivo precisa das suas contas (Vercel/DNS/IDs); Lighthouse deve confirmar que consent/GTM não pesam no LCP (carregar pós-idle).
- **Consistência:** medição só pós-consentimento; IDs via env; redirects a partir do mapa do blog + da spec; headers/redirects centralizados no `vercel.json`.
