# Conversion Tracking Hardening — Design Spec

- **Date:** 2026-06-16
- **Status:** Approved in brainstorming — pending implementation plan
- **Context:** RoboterSys site rebuild (Astro 5, Vercel). Measurement foundation already shipped in Phase 5.

## Problem

On the legacy site a **WhatsApp click counts as a conversion even when no message is sent**, and **form submissions and WhatsApp clicks are equal-weight conversions** in Google Ads. Smart Bidding therefore optimizes toward the weakest signal (cheap WhatsApp clicks) instead of real leads (form submissions).

**Goal:** make form submissions the primary optimization signal, demote WhatsApp/phone clicks to secondary (observe-only), and improve conversion match quality — all without breaking LGPD/consent.

## Current state (already shipped — do NOT rebuild)

- **GTM** — env-gated via `PUBLIC_GTM_ID` (`src/components/Analytics.astro`). No ID → zero gtag/dataLayer/network. *(Plan item 1: done — only needs the ID set in Vercel.)*
- **Consent Mode v2** — default-denied; banner in `src/components/CookieConsent.astro` + `src/scripts/consent.ts`; models conversions for users who decline. *(Plan item 6: done.)*
- **Event helper** — `pushEvent()` in `src/scripts/analytics.ts`, no-op-safe dataLayer push.
- **Distinct events already fire:**
  - `generate_lead` (`form_variant`) — `ContactForm.astro` inline script, **only on confirmed API success** (`res.ok && data.ok`), not on button click.
  - `whatsapp_click` (`source: floating_cta | link`) — `initGlobalTracking()` + `floating-whatsapp.ts`.
  - `phone_click` (`phone`) — `initGlobalTracking()` on `tel:` links.
- **gclid/UTM capture** — `ContactForm.astro` fills hidden fields (`utm_source/medium/campaign`, `gclid`) from `location.search`, sent to backend/CRM on submit.

## Decisions (from brainstorming)

1. Form conversion fires on **AJAX success** (current behavior). **No `/obrigado` page.**
2. Deliverable = **site code changes + a GTM/Google Ads runbook** the client executes (no access to their Google accounts).
3. Enhanced Conversions: push **normalized, unhashed** email/phone to the dataLayer; the **Google tag hashes (SHA-256) in the browser** before sending. **No** client-side pre-hashing.

## Scope of work

### 1. Event taxonomy (formalize what exists)

| Event | Trigger | Params | Google Ads role |
|---|---|---|---|
| `generate_lead` | confirmed form success | `form_variant` | **Primary** |
| `whatsapp_click` | wa.me/whatsapp link click | `source` | Secondary (observe) |
| `phone_click` | `tel:` link click | `phone` | Secondary (observe) |

No code change here beyond adding `user_data` to `generate_lead` (next). The **primary vs secondary** designation is a Google Ads UI action (runbook), made possible because the site already emits separate events.

### 2. Enhanced Conversions — `src/components/ContactForm.astro`

On the existing `generate_lead` push (success branch only), include a `user_data` object built from the form **before `form.reset()`**:

```js
window.dataLayer.push({
  event: 'generate_lead',
  form_variant: variant,
  user_data: {
    email: normEmail,        // email.trim().toLowerCase()
    phone_number: normPhone, // E.164: digits only; prefix +55 if missing -> "+55XXXXXXXXXXX"
  },
});
```

- `normEmail` = `email.trim().toLowerCase()`.
- `normPhone` = strip non-digits from the WhatsApp field; if it does not start with `55`, prefix it; emit `+55XXXXXXXXXXX`. If empty/invalid, **omit** `phone_number`.
- **No hashing in our code** — Google's tag hashes client-side. Consent Mode gates usage (no `ad_user_data` consent → not used).
- `user_data` is consumed by GTM's Enhanced Conversions config (runbook step 5).

### 3. gclid first-party persistence — `src/scripts/attribution.ts` (new)

Problem: today the hidden `gclid` field is only filled if `gclid` is in **that page's** URL. Landing on `/` with `?gclid=…`, navigating, then submitting on `/contato` **loses** it.

- On every page load, read `gclid` (+ `wbraid`, `gbraid`) from `location.search`.
- If present **and `ad_storage` consent is granted**, store in a first-party cookie (`rs_gclid`, ~90 days, `SameSite=Lax`).
- `ContactForm.astro` hidden `gclid` field: populate from the URL (as today); if absent, fall back to the `rs_gclid` cookie.
- **Consent nuance (LGPD):** the cookie is ad-attribution storage → set it **only when `ad_storage` is granted**, consistent with Consent Mode. The URL→hidden-field→backend capture on submit is user-initiated first-party data and stays as-is.
- **Accepted limitation:** with consent denied, gclid does not persist across navigation (correct under LGPD). Same-page submits still capture it from the URL.
- Wire `attribution.ts` to run on every page — import alongside `initGlobalTracking()` in `CookieConsent.astro`'s script (already rendered on every page via `BaseLayout`).

### 4. GTM + Google Ads runbook — `docs/reference/gtm-google-ads-conversions.md` (new)

Step-by-step for the client to execute in their own accounts:

1. GTM: 3 **Custom Event** triggers — `generate_lead`, `whatsapp_click`, `phone_click`.
2. GTM: Data Layer Variables — `form_variant`, `user_data`, `source`, `phone`.
3. GTM: one Google tag (config) + 3 Google Ads Conversion Tracking tags (one per trigger), each with the client's conversion ID/label.
4. Google Ads: mark `generate_lead` = **Primary**; `whatsapp_click` + `phone_click` = **Secondary (observe)**.
5. Enable **Enhanced Conversions** on the lead conversion; map user-provided data to `{{DLV - user_data}}`.
6. Verify **Consent Mode v2** in Tag Assistant (`ad_user_data` / `ad_storage` states).
7. QA: GTM Preview + Tag Assistant + Google Ads "conversion diagnostics".

### 5. Verification (code side)

- GTM Preview: `generate_lead` with `user_data` appears **only on success**; `whatsapp_click` / `phone_click` on the right clicks with **no duplicates** (floating CTA already de-duped).
- gclid persists across navigation and reaches the hidden field on submit (with consent).
- With `PUBLIC_GTM_ID` unset: no pushes that leak to the network; `astro check` 0 errors, `npm run build`, `npm test` green.

## Out of scope (YAGNI)

- `/obrigado` thank-you page.
- Offline conversion import into Ploomes / Google Ads (CRM workflow — separate project).
- New form fields; changing the form's submit transport.

## Files touched

- `src/components/ContactForm.astro` — add `user_data` to the success-branch `generate_lead` push; gclid fallback from cookie.
- `src/scripts/attribution.ts` *(new)* — gclid/wbraid/gbraid first-party persistence (consent-gated).
- `src/components/CookieConsent.astro` — import/run the attribution capture (already runs `initGlobalTracking()`).
- `docs/reference/gtm-google-ads-conversions.md` *(new)* — the runbook.
