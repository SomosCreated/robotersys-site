# Security Headers, CSP & Performance Notes — Phase 5 / M3

Companion notes for `vercel.json` (root). Covers the security headers, why the CSP
ships as Report-Only, and the static performance posture. The live Lighthouse run
and the CSP promotion are **M4 / Vercel-preview** tasks (documented below).

## Redirects (301)

`vercel.json` wires **30** permanent (`statusCode: 301`) redirects from the old
WordPress URLs (root-domain, trailing-slash) to the new Astro paths:

- **26 blog posts** — 19 PT (`/<slug>/` → `/blog/<slug>/`) + 7 EN
  (`/<slug>/` → `/en/blog/<slug>/`), from `docs/reference/blog-redirects.md`.
- **2 category indexes** — `/category/pt/` → `/blog/`, `/category/en/` → `/en/blog/`.
- **2 language landings** — `/remote-support-usa/` → `/en/`,
  `/remote-support-latam/` → `/es/`.

`source` values **keep the trailing slash** because the site is
`trailingSlash: 'always'` (the old indexed URLs all had trailing slashes).
We use `statusCode: 301` (NOT `permanent: true`, which would emit 308) so the
redirect is the SEO-canonical permanent form.

### Slugs deliberately NOT redirected

The PT core-page slugs were **preserved** from the old WP site, so no redirect is
needed (verified against the new pages in `src/pages/`):
`servicos`, `sistemas-roboticos`, `solucoes-pushcorp`, `pecas-de-reposicao`,
`sobre-nos`, `trabalhe-conosco`, `contato`, `politica-de-privacidade`,
`politica-de-cookies`. The old `/blog/` already equals the new `/blog/` → no
redirect. No conflicting evidence was found in the repo.

> **M4 runbook follow-up:** before cutover, pull the pre-cutover **Search Console**
> URL list to capture any remaining unknown old slugs (e.g. legacy pages or
> tag/author archives not represented in the blog map) and add redirects for them.

## Security headers (applied site-wide, `"/(.*)"`)

| Header | Value | Why |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS for 2y, subdomains, preload-list eligible. |
| `X-Content-Type-Options` | `nosniff` | Block MIME-type sniffing. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Send origin (not full path) cross-origin. |
| `X-Frame-Options` | `SAMEORIGIN` | Legacy clickjacking guard (CSP `frame-ancestors 'self'` is the modern twin). |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | We use none of these; QR scanning happens on the visitor's phone, not our page. |

## CSP — shipped as **Report-Only** on launch

The Content-Security-Policy is delivered via the **`Content-Security-Policy-Report-Only`**
header — it **reports** violations but does **not** block anything yet.

**Why Report-Only at launch:** a strict CSP can silently break GTM / GA4 / Google Ads
conversion tracking and the youtube-nocookie embed, and we can't live-test it in this
environment. Report-Only lets the user observe real violations on the Vercel **preview**
deploy, then flip to enforcing with confidence.

**Promotion (do this after validating on the preview):** rename the header key from
`Content-Security-Policy-Report-Only` to **`Content-Security-Policy`** in `vercel.json`.
No value changes should be needed if the preview shows zero violations for normal use
(homepage, blog, contact form submit, cookie-consent accept → GTM load, YouTube play).

**The policy (tuned for this stack):**

- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com`
  — GTM/GA/Ads need inline + these origins; **nonces are impractical with static + GTM**.
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: https:` — Astro images are self; GA/Ads pixels + YouTube thumbnails need https.
- `font-src 'self'` — the Ubuntu woff2 is self-hosted (`/fonts/`).
- `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net`
- `frame-src https://www.youtube-nocookie.com https://www.googletagmanager.com` — lazy YouTube embed + GTM preview.
- `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'self'`.

**Not in the browser CSP (by design):** the contact form POSTs **same-origin** to
`/api/contact`; the **server** then calls Ploomes/Resend. Those are server-to-server
calls, not browser origins, so they do **not** belong in `connect-src`.

**Keystatic admin:** `/keystatic` is a server route with a React island. Because the
CSP is Report-Only it cannot lock the island out; the build still emits the route
(`.vercel/output/_functions/pages/keystatic/`). When promoting the CSP to enforcing,
re-check `/keystatic` on the preview — its island is same-origin (`'self'`), so the
current policy should already cover it.

## Performance — static audit (M3)

> The **real Lighthouse run happens on the Vercel preview deploy** (M4 / user step) —
> a live run needs a running server + headless Chrome, which is fragile here and is
> better measured against the deployed preview. This section documents the **expected
> posture** from a static audit of `dist/`.

**Expected: Performance / SEO / A11y / Best-Practices ≥ 95.** What to watch on the
preview run:

- **LCP = the hero image.** Keep GTM/consent deferred so they never become
  render-blocking (confirmed below). Hero is optimized + the Ubuntu font is preloaded.
- Confirm the consent banner and GTM loader don't regress LCP (they load post-idle).

### Static findings (from `dist/`)

**JS bundle sizes** (`du -sh dist/client/_astro/*.js | sort -h`):

```
4.0K  (per-component island scripts: Home, Servicos, Sistemas, Pecas, Pushcorp,
       Sobre, Privacidade, Cookies, Carreiras, CookieConsent, FloatingWhatsApp,
       LanguageSwitcher, analytics) — ~13 tiny scripts, 4 KB each
 16K  index.BbL0Bame.js            (shared chunk)
180K  client.CpCGjU7b.js           (React island runtime — only on pages with an island)
2.6M  keystatic-page.AiFDX6Sp.js   (ADMIN ONLY — see below)
```

- **Public JS total (excluding keystatic): ~256 KB** across all `_astro` scripts.
  The home page ships **minimal JS** — only tiny Astro island scripts (4 KB each);
  React's `client.*` runtime is pulled in only where an island actually hydrates.
- **CSS is inlined/small:** homepage has an inlined `<style>` block plus one small
  external stylesheet; total CSS in `dist` is ~56 KB. `build.inlineStylesheets: 'auto'`.
- **Images optimized:** 50 `.webp` assets generated via `astro:assets` (Sharp). The
  YouTube facade uses a lazy thumbnail (`loading="lazy"`); the iframe is injected only
  on click (no youtube-nocookie request before interaction).
- **Ubuntu font preloaded:** `<link rel="preload" as="font" type="font/woff2"
  href="/fonts/ubuntu-latin-400-normal.woff2" crossorigin>` (self-hosted).
- **GTM / consent are deferred, not render-blocking:** `Analytics.astro` sets Consent
  Mode v2 defaults inline, then loads the GTM container via `requestIdleCallback`
  (fallback `setTimeout`, 2 s) — it never blocks first paint / LCP. With no
  `PUBLIC_GTM_ID` it emits nothing at all (true no-op).

### Keystatic chunk is admin-only (not on public pages)

The ~2.6 MB `keystatic-page.*.js` chunk is loaded **only** by the `/keystatic` admin
route (server-rendered, noindexed via robots.txt). It is **not** referenced by any
public page:

- `grep -c keystatic dist/client/index.html` → **0**
- No public HTML in `dist/client` references `keystatic` (full grep → none).
- The route is emitted as a server function: `.vercel/output/_functions/pages/keystatic/`.

So the heavy admin bundle has **zero** impact on public-page performance.
