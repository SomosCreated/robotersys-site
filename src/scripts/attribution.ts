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
