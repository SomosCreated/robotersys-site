# Conversion Tracking Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make form submissions the primary, Enhanced-Conversions-enriched signal and demote WhatsApp/phone clicks to observe-only, by adding `user_data` to the existing `generate_lead` event and persisting the gclid across navigation — without breaking LGPD/consent.

**Architecture:** Pure, unit-tested normalizers live in `src/lib/` (no DOM). A bundled `lead.ts` listens for a `rs:lead` CustomEvent (dispatched by the form's existing inline success handler), builds `user_data`, and pushes `generate_lead`. A bundled `attribution.ts` captures Google click-ids on every page into a consent-gated first-party cookie and back-fills empty hidden `gclid` form fields. The runbook (GTM/Google Ads config) ships as a doc the client executes.

**Tech Stack:** Astro 5, TypeScript, vitest (`vitest run`), Google Tag Manager + Consent Mode v2 (already installed).

---

## Background (already shipped — do NOT rebuild)

- `src/components/Analytics.astro` — env-gated GTM (`PUBLIC_GTM_ID`), Consent Mode v2 default-denied.
- `src/scripts/consent.ts` — banner controller. Accept → `localStorage['rs-consent']='granted'` + `gtag('consent','update',{...granted})` + `pushEvent('consent_granted')`.
- `src/scripts/analytics.ts` — `pushEvent()` (no-op-safe) and `initGlobalTracking()` (fires `whatsapp_click`/`phone_click`). `Window.dataLayer` is declared globally here.
- `src/components/ContactForm.astro` — inline `<script is:inline define:vars={{ formId, variant }}>`. On `res.ok && data.ok` it currently pushes `{ event:'generate_lead', form_variant: variant }`. Fields: `email-${formId}`, `whatsapp-${formId}`, hidden `gclid-${formId}`. Inline script already captures `utm_*`/`gclid` from `location.search`.
- `src/components/CookieConsent.astro` — bundled `<script>` runs on every page (via `BaseLayout`): imports `consent.ts` + calls `initGlobalTracking()`.

## File structure (created / modified)

- Create `src/lib/userdata.ts` — pure Enhanced-Conversions normalizers.
- Create `src/lib/attribution.ts` — pure click-id + cookie parsers.
- Create `src/scripts/lead.ts` — bundled `rs:lead` listener → `generate_lead` push.
- Create `src/scripts/attribution.ts` — bundled DOM/cookie wrapper (consent-gated persistence + form back-fill).
- Create `tests/userdata.test.ts`, `tests/attribution.test.ts`, `tests/lead.test.ts`.
- Create `docs/reference/gtm-google-ads-conversions.md` — the runbook.
- Modify `src/components/ContactForm.astro` — success branch dispatches `rs:lead`; add bundled `import '@/scripts/lead.ts'`.
- Modify `src/scripts/consent.ts` — dispatch `rs:consent-granted` on Accept.
- Modify `src/components/CookieConsent.astro` — `initAttribution()` alongside `initGlobalTracking()`.

---

## Task 1: Pure Enhanced-Conversions normalizers (`src/lib/userdata.ts`)

**Files:**
- Create: `src/lib/userdata.ts`
- Test: `tests/userdata.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/userdata.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeEmail, normalizePhoneBR, buildUserData } from '@/lib/userdata';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
  });
  it('returns undefined for empty or non-address input', () => {
    expect(normalizeEmail('')).toBeUndefined();
    expect(normalizeEmail(null)).toBeUndefined();
    expect(normalizeEmail('not-an-email')).toBeUndefined();
  });
});

describe('normalizePhoneBR', () => {
  it('formats a masked 11-digit mobile to E.164', () => {
    expect(normalizePhoneBR('(47) 99999-9999')).toBe('+5547999999999');
  });
  it('keeps an existing 55 country code', () => {
    expect(normalizePhoneBR('+55 47 99999-9999')).toBe('+5547999999999');
    expect(normalizePhoneBR('5547999999999')).toBe('+5547999999999');
  });
  it('handles a 10-digit landline', () => {
    expect(normalizePhoneBR('4733334444')).toBe('+554733334444');
  });
  it('returns undefined for implausible input', () => {
    expect(normalizePhoneBR('123')).toBeUndefined();
    expect(normalizePhoneBR('')).toBeUndefined();
  });
});

describe('buildUserData', () => {
  it('includes only present, normalized fields', () => {
    expect(buildUserData('A@B.com', '(47)99999-9999')).toEqual({
      email: 'a@b.com',
      phone_number: '+5547999999999',
    });
  });
  it('omits absent fields', () => {
    expect(buildUserData('', '')).toEqual({});
    expect(buildUserData('a@b.com', 'xx')).toEqual({ email: 'a@b.com' });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/userdata.test.ts`
Expected: FAIL — cannot resolve `@/lib/userdata`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/userdata.ts`:

```ts
/**
 * userdata.ts — pure normalizers for Google Ads Enhanced Conversions `user_data`.
 *
 * No DOM, no side effects. We send NORMALIZED-but-UNHASHED values; Google's tag
 * SHA-256-hashes them in the browser before sending, gated by Consent Mode
 * (ad_user_data). Keeping these pure makes them unit-testable.
 */

export interface UserData {
  email?: string;
  phone_number?: string;
}

/** trim + lowercase; undefined if not a plausible address. */
export function normalizeEmail(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const e = raw.trim().toLowerCase();
  return e.includes('@') && e.length >= 3 ? e : undefined;
}

/** Brazilian phone -> E.164 (+55DDDNNNNNNNN); undefined if implausible. */
export function normalizePhoneBR(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return '+' + digits;
  }
  if (digits.length === 10 || digits.length === 11) {
    return '+55' + digits;
  }
  return undefined;
}

/** Build the `user_data` object, omitting absent/invalid fields. */
export function buildUserData(
  email?: string | null,
  phone?: string | null,
): UserData {
  const out: UserData = {};
  const e = normalizeEmail(email);
  const p = normalizePhoneBR(phone);
  if (e) out.email = e;
  if (p) out.phone_number = p;
  return out;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/userdata.test.ts`
Expected: PASS (3 suites, all green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/userdata.ts tests/userdata.test.ts
git commit -m "feat(tracking): pure Enhanced-Conversions user_data normalizers"
```

---

## Task 2: Pure click-id + cookie parsers (`src/lib/attribution.ts`)

**Files:**
- Create: `src/lib/attribution.ts`
- Test: `tests/attribution.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/attribution.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { extractClickIds, readCookie } from '@/lib/attribution';

describe('extractClickIds', () => {
  it('extracts gclid', () => {
    expect(extractClickIds('?gclid=abc123&foo=1')).toEqual({ gclid: 'abc123' });
  });
  it('extracts wbraid and gbraid', () => {
    expect(extractClickIds('?wbraid=w1&gbraid=g1')).toEqual({ wbraid: 'w1', gbraid: 'g1' });
  });
  it('returns empty object when none present', () => {
    expect(extractClickIds('')).toEqual({});
    expect(extractClickIds('?utm_source=google')).toEqual({});
  });
});

describe('readCookie', () => {
  it('reads a named cookie value', () => {
    expect(readCookie('a=1; rs_gclid=xyz; b=2', 'rs_gclid')).toBe('xyz');
  });
  it('decodes URI-encoded values', () => {
    expect(readCookie('rs_gclid=a%20b', 'rs_gclid')).toBe('a b');
  });
  it('returns undefined when absent', () => {
    expect(readCookie('a=1', 'rs_gclid')).toBeUndefined();
    expect(readCookie('', 'rs_gclid')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/attribution.test.ts`
Expected: FAIL — cannot resolve `@/lib/attribution`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/attribution.ts`:

```ts
/**
 * attribution.ts — pure helpers for Google ad click-id capture. No DOM.
 */
export interface ClickIds {
  gclid?: string;
  wbraid?: string;
  gbraid?: string;
}

const KEYS: (keyof ClickIds)[] = ['gclid', 'wbraid', 'gbraid'];

/** Extract Google click ids from a URL query string (e.g. location.search). */
export function extractClickIds(search: string): ClickIds {
  const params = new URLSearchParams(search);
  const out: ClickIds = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  return out;
}

/** Read a cookie value from a `document.cookie`-style string. */
export function readCookie(cookieString: string, name: string): string | undefined {
  const escaped = name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const match = cookieString.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/attribution.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/attribution.ts tests/attribution.test.ts
git commit -m "feat(tracking): pure click-id + cookie parsers"
```

---

## Task 3: Lead event bridge (`src/scripts/lead.ts`) + wire into the form

**Files:**
- Create: `src/scripts/lead.ts`
- Test: `tests/lead.test.ts`
- Modify: `src/components/ContactForm.astro` (success branch ~407-417; add bundled import near the end of the file)

- [ ] **Step 1: Write the failing test for the pure event builder**

Create `tests/lead.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildLeadEvent } from '@/scripts/lead';

describe('buildLeadEvent', () => {
  it('includes user_data when email/phone are valid', () => {
    expect(buildLeadEvent({ variant: 'produto', email: 'A@B.com', phone: '(47)99999-9999' })).toEqual({
      event: 'generate_lead',
      form_variant: 'produto',
      user_data: { email: 'a@b.com', phone_number: '+5547999999999' },
    });
  });
  it('omits user_data when no valid PII', () => {
    expect(buildLeadEvent({ variant: 'contato' })).toEqual({
      event: 'generate_lead',
      form_variant: 'contato',
    });
  });
  it('defaults the variant', () => {
    expect(buildLeadEvent({})).toEqual({ event: 'generate_lead', form_variant: 'contato' });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/lead.test.ts`
Expected: FAIL — cannot resolve `@/scripts/lead`.

- [ ] **Step 3: Write the implementation**

Create `src/scripts/lead.ts`:

```ts
/**
 * lead.ts — bridge between the form's inline success handler and GTM.
 *
 * The inline ContactForm script dispatches a `rs:lead` CustomEvent on confirmed
 * API success (carrying the raw email/phone read before form.reset()). Here we
 * build the Enhanced-Conversions `user_data` (via the tested pure normalizers)
 * and push `generate_lead` onto the dataLayer. No-op-safe: with no GTM loaded
 * the push lands on a plain array and is harmless.
 */
import { buildUserData } from '@/lib/userdata';

export interface LeadDetail {
  variant?: string;
  email?: string;
  phone?: string;
}

/** Build the GTM dataLayer object for a confirmed lead (pure; unit-tested). */
export function buildLeadEvent(detail: LeadDetail): Record<string, unknown> {
  const user_data = buildUserData(detail.email, detail.phone);
  const evt: Record<string, unknown> = {
    event: 'generate_lead',
    form_variant: detail.variant ?? 'contato',
  };
  if (Object.keys(user_data).length > 0) evt.user_data = user_data;
  return evt;
}

function onLead(e: Event): void {
  const detail = (e as CustomEvent<LeadDetail>).detail ?? {};
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(buildLeadEvent(detail));
  } catch {
    /* never block UX on tracking */
  }
}

document.addEventListener('rs:lead', onLead);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/lead.test.ts`
Expected: PASS.

- [ ] **Step 5: Replace the form's success-branch push with a `rs:lead` dispatch**

In `src/components/ContactForm.astro`, find the success branch:

```js
        if (res.ok && data.ok) {
          showStatus(
            '✓ Mensagem enviada! Em breve nossa equipe entrará em contato.',
            'success',
          );
          // Measurement: lead generated (no-op-safe; GTM picks it up if loaded).
          try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'generate_lead', form_variant: variant });
          } catch (err) { /* never block UX on tracking */ }
          form.reset();
        } else {
```

Replace it with (read email/phone BEFORE `form.reset()`):

```js
        if (res.ok && data.ok) {
          showStatus(
            '✓ Mensagem enviada! Em breve nossa equipe entrará em contato.',
            'success',
          );
          // Measurement: signal a confirmed lead with the user's email/phone so
          // the bundled lead.ts builds Enhanced-Conversions user_data and pushes
          // generate_lead. Read field values BEFORE form.reset().
          try {
            const emailEl = document.getElementById(`email-${formId}`);
            const phoneEl = document.getElementById(`whatsapp-${formId}`);
            document.dispatchEvent(new CustomEvent('rs:lead', {
              detail: {
                variant,
                email: emailEl ? emailEl.value : '',
                phone: phoneEl ? phoneEl.value : '',
              },
            }));
          } catch (err) { /* never block UX on tracking */ }
          form.reset();
        } else {
```

- [ ] **Step 6: Register the listener — add a bundled script to ContactForm**

In `src/components/ContactForm.astro`, immediately AFTER the closing `</script>` of the existing `<script is:inline …>` block (near the end of the file), add a separate bundled script:

```astro
<script>
  // Bundled (module) — registers the rs:lead -> generate_lead bridge once per page.
  import '@/scripts/lead.ts';
</script>
```

- [ ] **Step 7: Build and verify the wiring in the preview**

Run: `npx astro check` → expect 0 errors. Then `npm run build` → expect "Complete!".

Then start the preview (`preview_start` "astro-dev"), navigate to `/contato/`, and eval:

```js
(() => {
  window.dataLayer = window.dataLayer || [];
  document.dispatchEvent(new CustomEvent('rs:lead', {
    detail: { variant: 'produto', email: 'A@B.com', phone: '(47) 99999-9999' },
  }));
  return window.dataLayer[window.dataLayer.length - 1];
})()
```

Expected result:
```json
{ "event": "generate_lead", "form_variant": "produto",
  "user_data": { "email": "a@b.com", "phone_number": "+5547999999999" } }
```

- [ ] **Step 8: Commit**

```bash
git add src/scripts/lead.ts tests/lead.test.ts src/components/ContactForm.astro
git commit -m "feat(tracking): Enhanced-Conversions user_data on generate_lead via rs:lead bridge"
```

---

## Task 4: Consent-gated gclid persistence (`src/scripts/attribution.ts`)

**Files:**
- Create: `src/scripts/attribution.ts`
- Modify: `src/scripts/consent.ts` (Accept handler ~80-84)
- Modify: `src/components/CookieConsent.astro` (bundled script ~74-79)

> Pure logic here (`extractClickIds`, `readCookie`) is already tested in Task 2. This task is DOM/cookie wiring, verified by build + preview rather than unit tests (node test env has no `document`/`localStorage`, matching the existing test-suite conventions).

- [ ] **Step 1: Write the implementation**

Create `src/scripts/attribution.ts`:

```ts
/**
 * attribution.ts — first-party Google click-id persistence (consent-gated).
 *
 * On every page: read gclid/wbraid/gbraid from the URL. If the user has granted
 * consent (rs-consent='granted', i.e. ad_storage granted), persist into the
 * `rs_gclid` first-party cookie (~90d) so the id survives navigation. Empty
 * hidden `gclid` form inputs are back-filled from the cookie (the form's own
 * URL capture still wins when a gclid is present on the form page).
 *
 * LGPD: nothing is stored without consent; the cookie is ad-attribution storage.
 */
import { extractClickIds, readCookie, type ClickIds } from '@/lib/attribution';

const COOKIE = 'rs_gclid';
const MAX_AGE = 90 * 24 * 60 * 60; // 90 days, seconds
const CONSENT_KEY = 'rs-consent';

function consentGranted(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

/** Read the persisted click-id (used by form back-fill). */
export function getStoredGclid(): string | undefined {
  return readCookie(document.cookie, COOKIE);
}

function persist(ids: ClickIds): void {
  const id = ids.gclid ?? ids.wbraid ?? ids.gbraid;
  if (!id) return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${COOKIE}=${encodeURIComponent(id)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

/** Back-fill empty hidden gclid inputs from the cookie. */
function fillForms(): void {
  const stored = getStoredGclid();
  if (!stored) return;
  document.querySelectorAll<HTMLInputElement>('input[name="gclid"]').forEach((input) => {
    if (!input.value) input.value = stored;
  });
}

export function initAttribution(): void {
  const ids = extractClickIds(location.search);
  if (consentGranted()) persist(ids);
  // First visit: if the user accepts AFTER landing, persist the still-present URL ids.
  document.addEventListener(
    'rs:consent-granted',
    () => persist(extractClickIds(location.search)),
    { once: true },
  );
  fillForms();
}
```

- [ ] **Step 2: Dispatch `rs:consent-granted` on Accept**

In `src/scripts/consent.ts`, find the Accept handler:

```ts
  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    writeChoice('granted');
    hide();
    grantConsent();
  });
```

Add the dispatch as the last line of the handler:

```ts
  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    writeChoice('granted');
    hide();
    grantConsent();
    // Let attribution.ts persist any gclid that was in the landing URL.
    document.dispatchEvent(new CustomEvent('rs:consent-granted'));
  });
```

- [ ] **Step 3: Run initAttribution on every page**

In `src/components/CookieConsent.astro`, replace the bundled script:

```astro
<script>
  import '@/scripts/consent.ts';
  import { initGlobalTracking } from '@/scripts/analytics';
  // Attach document-level phone/whatsapp click tracking once per page.
  initGlobalTracking();
</script>
```

with:

```astro
<script>
  import '@/scripts/consent.ts';
  import { initGlobalTracking } from '@/scripts/analytics';
  import { initAttribution } from '@/scripts/attribution';
  // Attach document-level phone/whatsapp click tracking once per page.
  initGlobalTracking();
  // Capture + persist gclid (consent-gated) and back-fill hidden form fields.
  initAttribution();
</script>
```

- [ ] **Step 4: Build and verify in the preview**

Run: `npx astro check` (0 errors) then `npm run build` ("Complete!").

Start preview, then eval this end-to-end check (simulates consent + a landing gclid, then checks the cookie and form back-fill on `/contato/`):

```js
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  localStorage.setItem('rs-consent', 'granted');
  // simulate landing with a gclid, then re-run capture
  history.replaceState(null, '', '/contato/?gclid=TEST_GCLID_123');
  const mod = await import('/src/scripts/attribution.ts');
  mod.initAttribution();
  await sleep(50);
  const cookieHit = document.cookie.includes('rs_gclid=TEST_GCLID_123');
  const field = document.querySelector('input[name="gclid"]');
  return { cookieHit, fieldValue: field ? field.value : 'NO FIELD' };
})()
```

Expected: `{ "cookieHit": true, "fieldValue": "TEST_GCLID_123" }`.

(If the dev server cannot import `/src/...` directly, instead verify by reloading `/contato/?gclid=TEST_GCLID_123` with `localStorage['rs-consent']='granted'` already set, then read `document.cookie` and the hidden field value.)

- [ ] **Step 5: Commit**

```bash
git add src/scripts/attribution.ts src/scripts/consent.ts src/components/CookieConsent.astro
git commit -m "feat(tracking): consent-gated first-party gclid persistence + form back-fill"
```

---

## Task 5: GTM + Google Ads runbook (`docs/reference/gtm-google-ads-conversions.md`)

**Files:**
- Create: `docs/reference/gtm-google-ads-conversions.md`

- [ ] **Step 1: Write the runbook**

Create `docs/reference/gtm-google-ads-conversions.md` with this content:

```markdown
# GTM + Google Ads — Conversion Setup Runbook

The site emits three distinct dataLayer events. This is the config to wire them
into Google Ads so **form = primary** and **WhatsApp/phone = secondary (observe)**.

## DataLayer events emitted by the site

| Event | When | Params |
|---|---|---|
| `generate_lead` | Contact form submitted **and** API confirmed success | `form_variant` (`contato`/`produto`/`carreiras`), `user_data` `{ email, phone_number }` (normalized, UNHASHED — Google hashes) |
| `whatsapp_click` | Click on any wa.me / whatsapp link | `source` (`floating_cta` / `link`) |
| `phone_click` | Click on any `tel:` link | `phone` |

## 0. Prerequisites
- Set `PUBLIC_GTM_ID=GTM-XXXXXXX` in Vercel → redeploy. (Without it the site emits nothing.)
- Consent Mode v2 is already on the site (default denied; granted on Accept).

## 1. GTM triggers (Triggers → New → Custom Event)
- `CE - generate_lead` → Event name `generate_lead`
- `CE - whatsapp_click` → Event name `whatsapp_click`
- `CE - phone_click` → Event name `phone_click`
- (Optional: to exclude job applications from the lead conversion, add a trigger
  condition `form_variant` does not equal `carreiras`.)

## 2. GTM Data Layer Variables (Variables → New → Data Layer Variable)
- `DLV - form_variant`, `DLV - user_data`, `DLV - source`, `DLV - phone`

## 3. GTM tags
- One **Google tag** (the GT-/AW- config) firing on All Pages (respecting consent).
- Three **Google Ads Conversion Tracking** tags, one per trigger above, each with
  its own Conversion ID + Label from Google Ads (step 4).

## 4. Google Ads conversion actions (Goals → Conversions → New)
- **Lead — Form** → category *Submit lead form* → fired by `CE - generate_lead`.
  Set as **Primary**.
- **WhatsApp click** → category *Contact* → fired by `CE - whatsapp_click`.
  Set as **Secondary** (Settings → "Secondary action / observation only").
- **Phone click** → category *Contact* → fired by `CE - phone_click`. **Secondary.**

Smart Bidding optimizes for **Primary** only → it now chases real form leads.

## 5. Enhanced Conversions (on the Lead — Form conversion)
- In the conversion action → **Enhanced conversions** → turn ON → method **Google Tag Manager**.
- In the Google Ads Conversion tag for the lead → **Include user-provided data** →
  choose **Manual / Code** → set the user-provided data variable to `{{DLV - user_data}}`.
- The values are unhashed; the Google tag SHA-256-hashes them in the browser and
  only sends them when `ad_user_data` consent is granted (Consent Mode handles this).

## 6. Verify Consent Mode v2
- GTM Preview / Tag Assistant: before Accept, consent states show `denied`; tags
  run in cookieless/modeling mode. After Accept (banner), `ad_user_data` /
  `ad_storage` flip to `granted` and the conversion tag sends user_data.

## 7. QA
- GTM Preview: submit the form → `generate_lead` with `user_data` appears once, on success.
- Click the WhatsApp button / a `tel:` link → `whatsapp_click` / `phone_click` once (no dupes).
- Google Ads → conversion action → "Diagnostics" shows Enhanced Conversions recording
  matches within ~24-48h.
```

- [ ] **Step 2: Commit**

```bash
git add docs/reference/gtm-google-ads-conversions.md
git commit -m "docs(tracking): GTM + Google Ads conversion setup runbook"
```

---

## Task 6: Full verification + final review

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass (the 56 existing + the 3 new files = 59+).

- [ ] **Step 2: Type-check and build**

Run: `npx astro check` → expect 0 errors.
Run: `npm run build` → expect "Complete!".

- [ ] **Step 3: No-leak check (no GTM id)**

Confirm `PUBLIC_GTM_ID` is unset locally, start the preview, load `/`, and eval:

```js
(() => {
  const hasGtm = !!document.querySelector('script[src*="googletagmanager.com/gtm.js"]');
  return { gtmScript: hasGtm, dataLayerType: Array.isArray(window.dataLayer) ? 'array' : typeof window.dataLayer };
})()
```

Expected: `{ "gtmScript": false, "dataLayerType": "array" }` — events accumulate harmlessly, nothing is sent.

- [ ] **Step 4: Final commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "chore(tracking): verification pass — check/build/tests green" || echo "nothing to commit"
```

---

## Self-review notes (author)

- **Spec coverage:** event taxonomy (Task 3/5), Enhanced Conversions `user_data` (Tasks 1+3), gclid persistence + consent gating (Tasks 2+4), runbook (Task 5), verification incl. no-leak (Task 6). All spec sections map to tasks.
- **Type consistency:** `buildUserData` → `UserData`; `buildLeadEvent(LeadDetail)`; `extractClickIds → ClickIds`; `readCookie(cookieString, name)`; `getStoredGclid()`. Names used identically across tasks.
- **Out of scope (unchanged):** no `/obrigado` page; no Ploomes offline import; no new form fields.
