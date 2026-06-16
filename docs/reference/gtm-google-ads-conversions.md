# GTM + Google Ads — Conversion Setup Runbook

The site emits three distinct dataLayer events. This is the config to wire them
into Google Ads so **form = primary** and **WhatsApp/phone = secondary (observe)**.

## DataLayer events emitted by the site

| Event | When | Params |
|---|---|---|
| `generate_lead` | Contact form submitted **and** API confirmed success | `form_variant` (`contato`/`produto`/`carreiras`), `user_data` `{ email, phone_number }` (normalized, UNHASHED — Google hashes in-browser & sends only when `ad_user_data` consent is granted) |
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

## Notes for offline conversion import (separate, future)
- The form also forwards `gclid` (URL or persisted `rs_gclid` cookie) + `utm_*` to the
  backend/CRM (Ploomes). When a lead closes, upload `gclid` + the conversion to Google
  Ads (offline conversion import) to optimize on revenue, not just form fills. Not part
  of this site change.
