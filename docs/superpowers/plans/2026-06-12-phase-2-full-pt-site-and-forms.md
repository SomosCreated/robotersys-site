# Fase 2 — Site PT completo + Formulários (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar o site em **PT**: todas as páginas internas (Serviços, Peças, Sistemas Robóticos, PushCorp, Sobre, Trabalhe Conosco, Contato), páginas legais (Privacidade, Cookies), 404, e o **sistema de formulários** (`/api/contact` → Resend + Ploomes) — tudo reutilizando a fundação da Fase 1.

**Architecture:** Continua Astro estático (SSG). As páginas internas reusam `BaseLayout` + um novo `PageHero` + componentes compartilhados. O endpoint `/api/contact` é a **única rota server** (`export const prerender = false` → função serverless na Vercel); as páginas seguem estáticas. Strings novas entram em `src/i18n/pt.ts`. Integrações (Resend/Ploomes) são cabeadas por env vars e degradam com elegância sem as chaves.

**Tech Stack:** Astro 5 (static + per-route `prerender=false`), `resend` (SDK), `zod` (validação), fetch nativo p/ Ploomes, Vitest.

**Pré-requisito de credenciais (não bloqueia o build):** `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO_COMMERCIAL`, `CONTACT_TO_RH`, `PLOOMES_API_KEY` (+ mapeamento de funil/campos do Ploomes a confirmar com o cliente). Documentar em `.env.example`.

## Estratégia de testes
- **Lógica (TDD com Vitest):** validação do form (`zod` schema), montagem do payload do Ploomes, montagem do e-mail Resend, lógica de antispam (honeypot/tempo). Testar com mocks — sem chamadas reais.
- **Páginas/visual:** `astro check` + `npm run build` (0 erros/0 warnings) + passe visual na `main` (preview).
- Commits frequentes.

## File Structure (novos/alterados)
```
src/
├─ pages/
│  ├─ servicos.astro
│  ├─ pecas-de-reposicao.astro
│  ├─ sistemas-roboticos.astro
│  ├─ solucoes-pushcorp.astro
│  ├─ sobre-nos.astro
│  ├─ trabalhe-conosco.astro
│  ├─ contato.astro
│  ├─ politica-de-privacidade.astro
│  ├─ politica-de-cookies.astro
│  ├─ 404.astro
│  └─ api/contact.ts            # serverless (prerender=false)
├─ components/
│  ├─ PageHero.astro            # cabeçalho de página interna (título + kicker + breadcrumb)
│  ├─ Breadcrumbs.astro
│  ├─ ContactForm.astro         # variante: contato | carreiras | produto
│  ├─ PartsGrid.astro           # 17 categorias de peças
│  ├─ CellGallery.astro         # galeria de células (Sistemas Robóticos)
│  ├─ FeatureCard.astro         # card genérico (diferenciais/valores/aplicações)
│  └─ ProseSection.astro        # bloco de conteúdo (história, missão, legal)
├─ lib/
│  ├─ validation.ts             # zod schemas dos formulários
│  ├─ resend.ts                 # envio de e-mail (degrada sem key)
│  ├─ ploomes.ts                # criação de lead (degrada sem key)
│  └─ antispam.ts               # honeypot + checagem de tempo
└─ i18n/pt.ts                   # + chaves novas

.env.example                    # documenta as env vars
tests/
├─ validation.test.ts
├─ ploomes.test.ts
└─ contact-endpoint.test.ts
```

---

## Milestone M1 — Sistema de formulários + página de Contato + componentes compartilhados

### Task 1: `.env.example` + deps
- [ ] **Step 1:** `npm install resend zod`
- [ ] **Step 2:** Criar `.env.example`:
```
# Resend (e-mail transacional)
RESEND_API_KEY=
RESEND_FROM="RoboterSys <site@robotersys.com.br>"
CONTACT_TO_COMMERCIAL=comercial@robotersys.com.br
CONTACT_TO_RH=rh@robotersys.com.br
# Ploomes (CRM) — confirmar mapeamento de funil/estágio/campos com o cliente
PLOOMES_API_KEY=
PLOOMES_API_BASE=https://public-api2.ploomes.com
```
- [ ] **Step 3:** Commit `chore: add form deps (resend, zod) + .env.example`.

### Task 2: Validação (TDD)
**Files:** `src/lib/validation.ts`, `tests/validation.test.ts`
- [ ] **Step 1 (test first):** escrever `tests/validation.test.ts` cobrindo: nome/email/whatsapp obrigatórios; email inválido falha; mensagem opcional; `type` ∈ {contato, carreiras, produto}; honeypot preenchido → inválido. Rodar → FALHA.
- [ ] **Step 2 (impl):** `src/lib/validation.ts` com `zod`:
```ts
import { z } from 'zod';
export const contactSchema = z.object({
  type: z.enum(['contato', 'carreiras', 'produto']).default('contato'),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  whatsapp: z.string().min(8).max(20),
  message: z.string().max(2000).optional().default(''),
  // metadados (ocultos)
  company: z.string().optional(),            // produto
  utm_source: z.string().optional(), utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(), gclid: z.string().optional(),
  // honeypot — deve vir vazio
  website: z.string().max(0).optional().default(''),
  // tempo de preenchimento (ms) — muito rápido = bot
  _elapsed: z.coerce.number().optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
```
- [ ] **Step 3:** rodar testes → PASSA. Commit `feat(forms): zod validation (TDD)`.

### Task 3: Antispam (TDD)
**Files:** `src/lib/antispam.ts`, incluir casos no test
- [ ] **Step 1 (test):** honeypot não-vazio → bloqueia; `_elapsed` < 1500ms → bloqueia; caso normal → passa. FALHA.
- [ ] **Step 2 (impl):**
```ts
export function isSpam(input: { website?: string; _elapsed?: number }): boolean {
  if (input.website && input.website.length > 0) return true;
  if (typeof input._elapsed === 'number' && input._elapsed < 1500) return true;
  return false;
}
```
- [ ] **Step 3:** PASSA. Commit `feat(forms): honeypot + timing antispam (TDD)`.

### Task 4: Resend + Ploomes (degradam sem key; payload testado)
**Files:** `src/lib/resend.ts`, `src/lib/ploomes.ts`, `tests/ploomes.test.ts`
- [ ] **Step 1 (test ploomes payload):** `buildPloomesContact(input)` mapeia name/email/whatsapp/message + origem/UTMs para o shape do Ploomes (`{ Name, Email, OtherProperties... }`). Testar o mapeamento puro. FALHA → impl → PASSA.
- [ ] **Step 2 (impl resend.ts):**
```ts
import { Resend } from 'resend';
export async function sendLeadEmail(input, { to }: { to: string }) {
  const key = import.meta.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: 'no RESEND_API_KEY' };
  const resend = new Resend(key);
  const flagged = input._ploomesFailed ? '⚠️ FALHA NO PLOOMES — cadastrar manualmente. ' : '';
  const { error } = await resend.emails.send({
    from: import.meta.env.RESEND_FROM, to,
    subject: `${flagged}[${input.type}] Lead: ${input.name}`,
    text: renderLeadText(input),
  });
  return { ok: !error, error };
}
```
- [ ] **Step 3 (impl ploomes.ts):** `createPloomesLead(input)` → `POST {BASE}/Contacts` com header `User-Key: <PLOOMES_API_KEY>`; retorna `{ok}`; se sem key → `{ok:false, skipped}`. (Mapeamento de funil/estágio/custom fields fica num único objeto de config no topo, marcado `// CONFIRMAR com o cliente`.)
- [ ] **Step 4:** testes do payload PASSAM. Commit `feat(forms): resend + ploomes integrations (graceful, payload TDD)`.

### Task 5: Endpoint `/api/contact` (TDD do handler)
**Files:** `src/pages/api/contact.ts`, `tests/contact-endpoint.test.ts`
- [ ] **Step 1 (test):** com mocks de resend/ploomes — input válido → 200 `{ok:true}`, chama email; honeypot → 200 fake-ok sem enviar; input inválido → 400. FALHA.
- [ ] **Step 2 (impl):**
```ts
export const prerender = false;
import type { APIRoute } from 'astro';
import { contactSchema } from '@/lib/validation';
import { isSpam } from '@/lib/antispam';
import { createPloomesLead } from '@/lib/ploomes';
import { sendLeadEmail } from '@/lib/resend';

export const POST: APIRoute = async ({ request }) => {
  const data = Object.fromEntries(await request.formData());
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.flatten() }, 400);
  const input = parsed.data;
  if (isSpam(input)) return json({ ok: true }, 200); // silencioso p/ bots
  const to = input.type === 'carreiras' ? import.meta.env.CONTACT_TO_RH : import.meta.env.CONTACT_TO_COMMERCIAL;
  const ploomes = await createPloomesLead(input);
  const email = await sendLeadEmail({ ...input, _ploomesFailed: !ploomes.ok }, { to });
  return json({ ok: email.ok || email.skipped ? true : false, ploomes: ploomes.ok }, 200);
};
const json = (b, s) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
```
- [ ] **Step 3:** PASSA. Confirmar `astro build` ainda gera as páginas estáticas + a função. Commit `feat(forms): /api/contact serverless endpoint (TDD)`.

### Task 6: `ContactForm.astro` + `PageHero` + `Breadcrumbs`
**Files:** `src/components/ContactForm.astro`, `PageHero.astro`, `Breadcrumbs.astro`
- [ ] **Step 1:** `PageHero.astro` (props: `kicker`, `title`, `crumbs`) — bloco de título de página interna no estilo HUD (menor que o hero da home, com `SectionLabel`/breadcrumb).
- [ ] **Step 2:** `Breadcrumbs.astro` (props: `items: {label,href}[]`) com JSON-LD `BreadcrumbList`.
- [ ] **Step 3:** `ContactForm.astro` (props: `variant`, `locale`) — campos Nome/Email/WhatsApp/Mensagem (+ Empresa se `produto`), honeypot `website` escondido, campo oculto `_elapsed` preenchido por `<script>` (timestamp on-load), UTMs/gclid capturados de `location.search` via `<script>`. `method=POST action=/api/contact`. Estados de loading/sucesso/erro via island leve. A11y: labels, `aria-describedby` p/ erros, foco.
- [ ] **Step 4:** build/check verdes. Commit `feat: ContactForm + PageHero + Breadcrumbs`.

### Task 7: Página `/contato/`
**Files:** `src/pages/contato.astro`
- [ ] **Step 1:** montar com `PageHero` + `ContactForm variant="contato"` + bloco de canais (WhatsApp 24h, telefone, e-mail, endereço, horário) + mapa embed (lazy iframe). Adicionar chaves i18n.
- [ ] **Step 2:** `astro check`/`build`/`test` verdes; commit `feat: Contato page`.

---

## Milestone M2 — Páginas de oferta (Serviços, Peças, Sistemas Robóticos, PushCorp)

> Para cada página: usar `BaseLayout` + `PageHero` + componentes existentes/novos. **Coletar a copy exata da página PT correspondente em robotersys.com** (instrução em cada task) e adicionar como chaves i18n. Terminar cada página com `ContactForm` (ou inquiry). Contraste WCAG AA, reduced-motion.

### Task 8: `/servicos/`
**Fonte de conteúdo:** `https://robotersys.com/servicos/` (e a análise na spec §6).
- [ ] Seções: PageHero "Serviços" → grid dos 6 serviços (reusar `ServiceCard` + `.spotlight-grid`) com texto expandido → bloco "Suporte Técnico" (lifecycle) → `ContactForm`. Commit.

### Task 9: `/pecas-de-reposicao/`
**Fonte:** `https://robotersys.com/pecas-de-reposicao/`.
- [ ] `PartsGrid.astro`: grid das **17 categorias** (KCP1/KCP2, membranas, placas MFC1/2/3, motores, cabos, baterias, correias, óleos, etc.) com ícone+label. Seções: PageHero "Peças de Reposição" → headline "Maior estoque de peças KUKA do sul do Brasil" → PartsGrid → 4 diferenciais (Amplo estoque, Peças testadas, Entrega express, Suporte ágil) via `FeatureCard` → `ContactForm`. Commit.

### Task 10: `/sistemas-roboticos/`
**Fonte:** `https://robotersys.com/sistemas-roboticos/`.
- [ ] `CellGallery.astro`: 4 tipos de célula (Paletização 1/2, Handling, Rebarbação) com "Saiba mais". Seções: PageHero → aplicações (paletização/handling/rebarbação/retrofit via `FeatureCard`) → CellGallery → faixa de clientes (placeholder logos) → `ContactForm`. Commit.

### Task 11: `/solucoes-pushcorp/`
**Fonte:** `https://robotersys.com/solucoes-pushcorp/`.
- [ ] Seções: PageHero "PushCorp · Integrador Parceiro" → sobre a parceria → aplicações de rebarbação → tecnologia compliance device (força controlada/compensação/versatilidade via `FeatureCard`) → diferenciais → `ContactForm variant="produto"` (consulta de produto). Commit.

---

## Milestone M3 — Páginas institucionais (Sobre, Trabalhe Conosco)

### Task 12: `/sobre-nos/`
**Fonte:** `https://robotersys.com/sobre-nos/`.
- [ ] `ProseSection` p/ história (origem Berlim, desde 2006) → Missão/Visão/Valores (Agilidade, Competitividade, Confiabilidade via `FeatureCard`) → reusar `StatsBand` → selo GPTW → `ContactForm`. Commit.

### Task 13: `/trabalhe-conosco/`
**Fonte:** `https://robotersys.com/trabalhe-conosco/`.
- [ ] Seções: PageHero → cultura (Inovação/Crescimento/Colaboração) → GPTW 4 anos → `ContactForm variant="carreiras"` (envia p/ RH) + menção a rh@robotersys.com.br. Commit.

---

## Milestone M4 — Legais + 404 + completar a Home

### Task 14: Páginas legais
**Files:** `src/pages/politica-de-privacidade.astro`, `politica-de-cookies.astro`
- [ ] `ProseSection` com conteúdo LGPD/GDPR base (coleta, finalidade, direitos do titular, contato do DPO/encarregado — placeholders marcados p/ revisão jurídica). Linkar no rodapé. Commit.

### Task 15: `404.astro`
- [ ] Página 404 no estilo HUD ("SINAL PERDIDO" / link de volta). Commit.

### Task 16: Completar a Home
- [ ] Adicionar à `index.astro` as seções que faltam vs. o site atual: **logos de clientes** (placeholder grid), **selo GPTW** (faixa), **descrição da empresa**, **teaser de blog** (3 cards placeholder até a Fase 4). Reusar componentes. Commit.

---

## Milestone M5 — Verificação da fase
- [ ] `npx astro check` 0 erros; `npm run build` 0 warnings; `npm test` (todos, incl. forms) verdes.
- [ ] Confirmar no build: `/api/contact` vira função; todas as páginas estáticas geradas; links de nav/rodapé batem com as rotas criadas.
- [ ] Passe visual na `main` (preview): home completa + cada página interna + um submit de formulário (mock, sem keys) retornando 200 e o estado de sucesso na UI.
- [ ] Conferir contraste/responsivo nas páginas novas.
- [ ] Commit final `chore(phase-2): full PT site + forms`.

---

## Self-Review (preenchido)
- **Cobertura vs spec:** todas as páginas internas PT (spec §6) ✓, formulários → Resend+Ploomes+log/sinalização (spec §10) ✓, legais p/ LGPD/GDPR (spec §6) ✓, 404 ✓. i18n EN/ES/DE fica na Fase 3; medição/consent/SEO/deploy na Fase 5 (fora desta fase).
- **Placeholders:** conteúdo legal, logos de clientes, teaser de blog e mapeamento fino do Ploomes são placeholders **explicitamente marcados** p/ dados reais/revisão — não entregáveis silenciosos.
- **Consistência:** `ContactForm`/`PageHero`/`FeatureCard` reusados em todas as páginas; endpoint único `/api/contact`; chaves i18n sob `pt.*`. Tipos do `contactSchema` (Task 2) reusados no endpoint (Task 5) e nos libs (Task 4).
- **Dependência externa:** o build e os testes (mockados) não dependem das chaves; só o teste *ao vivo* dos formulários precisa de Resend/Ploomes reais.
