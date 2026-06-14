# Deploy Runbook — RoboterSys (Vercel) — Fase 5 / M4

Guia passo a passo para colocar o site no ar na **Vercel** (preview → cutover) +
checklist completo de pré-lançamento. O site é **Astro 5 estático** com o adapter
`@astrojs/vercel` (`astro.config.mjs`): `site: 'https://robotersys.com'`,
`trailingSlash: 'always'`, i18n PT (root) / EN / ES / DE.

> **Repositório:** `https://github.com/SomosCreated/robotersys-site.git` (branch `main`).
> **Estado atual:** build / `astro check` / testes verdes (53 testes, 0 erros no check).
> O projeto **ainda não está vinculado** à Vercel (não existe `.vercel/project.json` —
> o que há em `.vercel/output/` é só artefato de build local).

**Documentos companheiros:**
- `docs/reference/security-perf-notes.md` — headers, CSP Report-Only, performance.
- `docs/reference/blog-redirects.md` — mapa de 301 (WP antigo → Astro).
- `docs/reference/design-system/` — tokens visuais.

---

## 1. Pré-flight: substituir placeholders antes do go-live

Itens **bloqueadores de lançamento** encontrados no repo. Marque cada um ao resolver.

| Item | Arquivo(s) | O que fazer |
|---|---|---|
| **Número de WhatsApp** (CTA principal + QR) | `src/components/Emergency24hCTA.astro` (linhas ~72, ~98) | Trocar `https://wa.me/55XXXXXXXXXXX` pelo número real (`55` + DDD + número, sem espaços/traços). Gerar e substituir também o QR `public/robotersys/img/whatsapp-qr.webp`. |
| **Número de WhatsApp** (botão flutuante) | `src/components/FloatingWhatsApp.astro` (linha ~32) | Mesmo número; trocar `wa.me/55XXXXXXXXXXX`. |
| **Número de WhatsApp** (página Contato) | `src/page-templates/Contato.astro` (linha ~45, `whatsappHref`) | Trocar `https://wa.me/55XXXXXXXX` pelo número real. |
| **Embed do mapa (Google Maps)** | `src/page-templates/Contato.astro` (linha ~256) | Colar a URL real de embed do Google Maps para *R. Parati, 335C — Joinville/SC*. |
| **Telefone exibido (PT)** | `src/i18n/pt.ts` (`whatsapp_number: '+55 (47) XXXXX-XXXX'`) | Confirmar e preencher o telefone real com o cliente. |
| **Imagem OG padrão** | `public/robotersys/og-default.jpg` (referenciada em `src/components/SEOHead.astro` l.14) | **Não existe.** Criar `1200×630 px` e salvar nesse caminho. Sem ela, todo compartilhamento social fica sem preview. |
| **Logo para JSON-LD** | `public/robotersys/img/logo.png` (referenciada em `src/components/StructuredData.astro` l.34) | **Não existe.** `Organization.logo` aponta para ela. Criar logo real **≥ 112×112 px**, PNG/JPG, fundo sólido (regra do Google). |
| **Tradução DE (revisão nativa)** | `src/i18n/de.ts` (22 marcadores `// REVISÃO` / `REVISAR`) | Tradução automática a partir do PT. Exige **revisão profissional nativa** antes do go-live (linhas 1, 193, 260, 278, 325, 408–409, 425–447…). |
| **Revisão EN/ES** | `src/i18n/en.ts` e `src/i18n/es.ts` (4 marcadores `// REVISAR` cada) | Revisar strings marcadas (`clients_body`, `historia_p3`, `gptw_text`); confirmar telefone/e-mail LATAM (ES l.340/345). |
| **Privacidade/Cookies — revisão jurídica** | `src/i18n/pt.ts` (l.367 `// MINUTA`), `src/i18n/en.ts` (l.368 `// DRAFT`) | Textos de política são **minuta** — pedir revisão jurídica antes do go-live. |
| **GTM / GA4 / Ads IDs** | `.env.example` → vars Vercel (ver §2) | Preencher `PUBLIC_GTM_ID` etc. **Vazio = nada de tracking carrega.** Configurar GA4 e Ads **dentro do GTM** (ver §1.1). |
| **Keystatic GitHub App** | `keystatic.config.ts` → vars Vercel (ver §2) | Necessário para o cliente editar posts em produção pelo `/keystatic`. |

> **Não bloqueiam o lançamento** (mas confirmar com o cliente quando possível): números de
> estatística "placeholder" (`Hero.astro`, `StatsBand.astro`, `Sobre.astro`, `Home.astro`);
> selo GPTW e grade de logos de clientes (`Home.astro`, `Sistemas.astro`); `IDs de funil/estágio`
> do Ploomes (`src/lib/ploomes.ts` — comentados, opcionais); rate-limit/Turnstile no
> formulário (`src/pages/api/contact.ts` l.41, TODO de hardening pós-launch).

### 1.1 Configuração dentro do GTM (medição)

`PUBLIC_GTM_ID` só **carrega o contêiner**. GA4 e Google Ads são configurados **dentro do
GTM**. O site já empurra estes eventos no `dataLayer` (use-os como gatilhos):

| Evento (`dataLayer`) | Disparado em | Onde no código |
|---|---|---|
| `generate_lead` | Envio do formulário de contato (com `form_variant`) | `src/components/ContactForm.astro` l.362 |
| `whatsapp_click` | Clique em qualquer link `wa.me` / botão flutuante (`source`) | `src/scripts/floating-whatsapp.ts`, `src/scripts/analytics.ts` |
| `phone_click` | Clique em link `tel:` (com `phone`) | `src/scripts/analytics.ts` l.52 |
| `language_switch` | Troca de idioma (com `language`) | `src/components/LanguageSwitcher.astro` l.96 |
| `consent_granted` | Usuário aceita cookies no banner | `src/scripts/consent.ts` l.43 |

No GTM: criar a tag **GA4 Configuration**, as tags de **conversão do Google Ads**, e gatilhos
de evento personalizado sobre os eventos acima. A medição respeita **Consent Mode v2**
(defaults negados até o aceite) — ver `Analytics.astro`.

---

## 2. Variáveis de ambiente (inventário completo)

Origem: `.env.example` + `keystatic.config.ts`. Configurar todas no **Vercel → Settings →
Environment Variables**, escopo **Production + Preview**.

> **Regra de segurança:** vars `PUBLIC_*` são **embutidas no bundle do cliente** (NÃO são
> secretas — qualquer visitante as lê). Todo o resto (Resend, Ploomes, segredos Keystatic)
> é **server-only** e nunca deve receber o prefixo `PUBLIC_`.

### Resend (e-mail transacional) — *server-only*

| Variável | Para que serve | Exemplo / formato | Tipo |
|---|---|---|---|
| `RESEND_API_KEY` | Chave da API Resend (envia o e-mail do lead) | `re_xxxxxxxx` | **secret** |
| `RESEND_FROM` | Remetente verificado no domínio | `"RoboterSys <site@robotersys.com.br>"` | config |
| `CONTACT_TO_COMMERCIAL` | Destino dos leads comerciais | `comercial@robotersys.com.br` | config |
| `CONTACT_TO_RH` | Destino dos leads de "Trabalhe Conosco" | `rh@robotersys.com.br` | config |

> Roteamento RH × comercial vive em `src/pages/api/contact.ts` (l.35): formulário
> `type === 'carreiras'` → `CONTACT_TO_RH`; caso contrário → `CONTACT_TO_COMMERCIAL`.

### Ploomes (CRM) — *server-only*

| Variável | Para que serve | Exemplo / formato | Tipo |
|---|---|---|---|
| `PLOOMES_API_KEY` | Chave da API Ploomes (cria o lead no CRM) | `xxxxxxxx` | **secret** |
| `PLOOMES_API_BASE` | Base da API pública Ploomes | `https://public-api2.ploomes.com` | config |

> Confirmar mapeamento de funil/estágio/campos com o cliente (`src/lib/ploomes.ts` tem
> `PipelineId`/`StageId` comentados, prontos para preencher se necessário).

### Medição — *PUBLIC_* (client-exposed)*

| Variável | Para que serve | Exemplo / formato | Tipo |
|---|---|---|---|
| `PUBLIC_GTM_ID` | ID do contêiner GTM (vazio = **nenhum** tracking carrega) | `GTM-XXXXXXX` | público |
| `PUBLIC_GA4_ID` | ID GA4 (documental; GA4 é configurado dentro do GTM) | `G-XXXXXXXXXX` | público |
| `PUBLIC_ADS_ID` | ID Google Ads (documental; configurado no GTM) | `AW-XXXXXXXXX` | público |
| `PUBLIC_ADS_CONVERSION_LABEL` | Label de conversão Ads (documental) | `AbC-D_efG…` | público |

### Keystatic (CMS do blog) — só em **produção** (storage GitHub)

Não estão no `.env.example` original (são posteriores ao blog) — **foram adicionados** ao
`.env.example` (comentados, com placeholders) neste M4. Em **dev local** o storage é `local`
(disco) e **nenhuma** destas é exigida; em **produção** (`import.meta.env.PROD`) o storage é
`github` e elas habilitam a edição via `/keystatic`. Fonte: `keystatic.config.ts` (l.28–35).

| Variável | Para que serve / onde obter | Exemplo / formato | Tipo |
|---|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Client ID do **Keystatic GitHub App** instalado no repo | `Iv1.xxxxxxxx` | **secret** |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Client Secret do mesmo GitHub App | `xxxxxxxx` | **secret** |
| `KEYSTATIC_SECRET` | Segredo aleatório p/ assinar a sessão do painel | `openssl rand -hex 32` (32+ chars) | **secret** |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Slug público do GitHub App (parte exposta) | `robotersys-blog` | público |

> Passo a passo de criação do app: `keystatic.config.ts` (cabeçalho) e
> https://keystatic.com/docs/github-app — ver também §6.3.

---

## 3. Setup do projeto na Vercel

- [ ] **Criar projeto / vincular o repo** `SomosCreated/robotersys-site` (confirmado via
  `git remote -v`). Em *New Project* → *Import Git Repository* → selecionar o repo.
- [ ] **Framework Preset:** `Astro` (auto-detectado).
- [ ] **Build Command:** `npm run build` (= `astro build`). **Output:** gerenciado pelo
  adapter `@astrojs/vercel` — não definir "Output Directory" manualmente.
- [ ] **Install Command:** `npm install` (padrão).
- [ ] **Node.js version:** usar a default LTS da Vercel (Astro 5 + adapter v8 são compatíveis).
- [ ] **Variáveis de ambiente:** adicionar **todas** as de §2 em *Settings → Environment
  Variables* nos escopos **Production e Preview**.
  - As `PUBLIC_*` precisam existir já em **build time** (são embutidas no bundle).
  - Os secrets (Resend/Ploomes/Keystatic) também — o route de contato é SSR (`prerender = false`).
- [ ] **Primeiro deploy → URL de preview** (`*.vercel.app`). **Não** apontar o domínio de
  produção ainda. Opcional: criar subdomínio `staging.robotersys.com` ou
  `novo.robotersys.com` para revisão do cliente **antes** do cutover.
- [ ] Confirmar que o build emitiu o route server do Keystatic
  (`.vercel/output/_functions/pages/keystatic/`) e o `/api/contact`.

> O `vercel.json` (raiz) é mesclado automaticamente pela Vercel: 30× redirect 301
> (WP→Astro) + headers de segurança + CSP (ver §4 / §5).

---

## 4. Checklist de validação no preview (antes do cutover)

Rodar **tudo** na URL de preview. Cada item é marcável.

### 4.1 Funcional / i18n
- [ ] Os 4 locales carregam: PT (root `/`), `/en/`, `/es/`, `/de/`.
- [ ] Toggle de tema (claro/escuro) funciona e persiste.
- [ ] Troca de idioma (`LanguageSwitcher`) mantém a rota equivalente.
- [ ] Botão flutuante e CTA de WhatsApp abrem o número **real** (placeholders resolvidos — §1).

### 4.2 Formulário de contato (ponta a ponta)
- [ ] Enviar o formulário → **e-mail chega** (via Resend) no destino certo.
- [ ] **Lead aparece no Ploomes** (CRM).
- [ ] Testar o **roteamento**: formulário de "Trabalhe Conosco" → `CONTACT_TO_RH`;
  demais → `CONTACT_TO_COMMERCIAL`.
- [ ] Validação de erro e mensagem de sucesso aparecem corretamente.

### 4.3 Consentimento (LGPD/GDPR)
- [ ] Banner de cookies aparece na primeira visita.
- [ ] **Aceitar** → GTM carrega (DevTools → Network mostra `gtm.js`).
- [ ] **Recusar** → GTM **não** carrega (sem `gtm.js`).
- [ ] **GA4 Realtime** registra a visita **somente após** o Aceite.
- [ ] Link "Preferências de cookies" no rodapé **reabre** o banner.

> Lembrete: sem `PUBLIC_GTM_ID` o bloco de medição é **no-op total** (nada é emitido).
> Para validar a medição, o ID precisa estar setado no escopo Preview.

### 4.4 Redirects (spot-check)
Confirmar `301` → novo caminho (ex.: `curl -I https://<preview>/<old-url>`):
- [ ] `/dimensionar-celula-paletizacao/` → `/blog/dimensionar-celula-paletizacao/`
- [ ] `/remote-support-usa/` → `/en/`
- [ ] `/category/pt/` → `/blog/`
- [ ] `/industrial-robot-selection/` → `/en/blog/industrial-robot-selection/`

(Lista completa: `vercel.json` / `docs/reference/blog-redirects.md`.)

### 4.5 SEO
- [ ] Rodar o JSON-LD no **Google Rich Results Test** (Organization / WebSite / BlogPosting /
  BreadcrumbList) — 0 erros.
- [ ] Confirmar `canonical`, `hreflang` + `x-default` e `og:image` (a OG real já existe — §1).
- [ ] `robots.txt` acessível (`/robots.txt`) e `sitemap-index.xml` acessível.

### 4.6 Lighthouse (mobile + desktop)
- [ ] Rodar na URL de preview. **Alvo ≥ 95** em Performance / SEO / A11y / Best-Practices.
- [ ] Confirmar que o GTM permanece **deferido** (não bloqueia render); **LCP = imagem do hero**.

(Posture estática e o que observar: `docs/reference/security-perf-notes.md`.)

### 4.7 CSP — coletar violações e **promover** para enforcing
Hoje o `vercel.json` envia **`Content-Security-Policy-Report-Only`** (não bloqueia nada).
- [ ] Com Report-Only ativo, abrir o **DevTools → Console** e navegar por **todas** as páginas.
- [ ] Exercitar: enviar o formulário, **reproduzir o vídeo** (YouTube facade), **aceitar
  cookies** (carrega GTM) — coletar quaisquer relatórios de violação de CSP.
- [ ] Ajustar a policy em `vercel.json` se houver violação legítima.
- [ ] **Promover:** renomear a chave do header de `Content-Security-Policy-Report-Only`
  para **`Content-Security-Policy`** (enforcing). Detalhes: `security-perf-notes.md` §CSP.
- [ ] Re-checar `/keystatic` (island same-origin) após promover.

---

## 5. Cutover (go-live)

- [ ] Na Vercel → *Settings → Domains*: adicionar `robotersys.com` **e** `www.robotersys.com`.
- [ ] Atualizar o DNS conforme as instruções da Vercel (registro **A** para o apex e/ou
  **CNAME** para `www`). Anotar **TTL** e aguardar **propagação**.
- [ ] Definir a redireção apex ↔ www desejada (ex.: `www` → apex) nas configs de domínio.
- [ ] Verificar **certificado HTTPS** emitido + **HSTS** ativo
  (`Strict-Transport-Security` já está no `vercel.json`; é `preload`-elegível).
- [ ] **Re-testar no domínio de produção:** redirects (§4.4) + formulário ponta a ponta (§4.2).
- [ ] Confirmar que a CSP enforcing (§4.7) não quebrou nada em produção.

---

## 6. Pós-lançamento

### 6.1 Google Search Console
- [ ] Adicionar a propriedade (`robotersys.com`) e validar.
- [ ] Submeter `sitemap-index.xml`.
- [ ] Nos dias seguintes, puxar o relatório **Páginas / 404** para capturar **slugs legados
  remanescentes** que **não** estão em `blog-redirects.md` (arquivos de tag/autor, paginação)
  e adicioná-los como `301` no `vercel.json`.

> Os slugs das páginas-núcleo PT foram **preservados** (sem redirect necessário). Lista e
> justificativa em `security-perf-notes.md` (seção "Slugs deliberately NOT redirected").

### 6.2 Medição (GA4 + Ads)
- [ ] Confirmar que conversões de **GA4** e **Google Ads** registram (testar um lead real).
- [ ] **Vincular** Google Ads ↔ GA4.
- [ ] Verificar que o Consent Mode banner **não** suprime as conversões modeladas
  (modeled conversions) — checar no painel do Ads.

### 6.3 Keystatic (edição em produção)
- [ ] Instalar o **Keystatic GitHub App** no repo: https://keystatic.com/docs/github-app
- [ ] Preencher as 4 vars Keystatic na Vercel (§2): `KEYSTATIC_GITHUB_CLIENT_ID`,
  `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
- [ ] Convidar a **conta editorial compartilhada** (`somoscreated` ou a do cliente) como
  colaboradora com **write** no repo.
- [ ] Abrir `https://robotersys.com/keystatic` → login GitHub → fazer **uma edição de teste**
  → confirmar que ela **commita** no repo e **dispara um rebuild** na Vercel.

---

## Apêndice — comandos de verificação local

```bash
npm run check     # astro check — deve dar 0 erros
npm run build     # build de produção (gera .vercel/output)
npm test          # vitest — 53 testes
git remote -v     # confirma o repo: SomosCreated/robotersys-site
```
