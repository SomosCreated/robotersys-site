/**
 * consent.ts — cookie-consent banner controller + Consent Mode v2 update logic.
 *
 * Responsibilities:
 *   1. On load, show the banner ONLY if the user has not yet made a choice
 *      (localStorage key `rs-consent` is unset). Returning visitors who already
 *      chose are never re-prompted.
 *   2. Accept  → persist 'granted', hide banner, call gtag consent update (all
 *      granted) and push a `consent_granted` dataLayer event.
 *   3. Reject  → persist 'denied', hide banner. Consent Mode stays denied
 *      (set as default in Analytics.astro) — nothing else to do.
 *   4. Expose window.openCookieConsent() so the footer "Cookies" trigger (and any
 *      [data-cookie-settings] element) can reopen the banner to change a choice.
 *
 * Privacy: no cookie/identifier is stored before consent. Consent Mode default
 * is `denied` (see Analytics.astro). This script only *raises* consent on Accept.
 */
import { pushEvent } from './analytics';

const STORAGE_KEY = 'rs-consent';
const BANNER_ID = 'cookie-consent';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
    openCookieConsent?: () => void;
  }
}

/** Apply the user's choice to Google Consent Mode (no-op if gtag absent). */
function grantConsent(): void {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  }
  pushEvent('consent_granted');
}

function initConsent(): void {
  const banner = document.getElementById(BANNER_ID);
  if (!banner) return;

  const show = () => {
    banner.classList.remove('hidden');
    banner.removeAttribute('hidden');
    // Move focus to the dialog for keyboard/AT users.
    const accept = banner.querySelector<HTMLElement>('[data-consent="accept"]');
    accept?.focus();
  };

  const hide = () => {
    banner.classList.add('hidden');
    banner.setAttribute('hidden', '');
  };

  const readChoice = (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const writeChoice = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage may be unavailable (private mode) — fail silently */
    }
  };

  // Wire buttons.
  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    writeChoice('granted');
    hide();
    grantConsent();
    // Let attribution.ts persist any gclid that was in the landing URL.
    document.dispatchEvent(new CustomEvent('rs:consent-granted'));
  });

  banner.querySelector('[data-consent="reject"]')?.addEventListener('click', () => {
    writeChoice('denied');
    hide();
    // Consent Mode remains denied — nothing else to do.
  });

  // Allow Escape to dismiss as a "reject for now" without persisting? We keep it
  // simple and a11y-correct: Escape only closes if a choice already exists,
  // otherwise the banner stays (a choice is required to proceed cookie-wise).
  banner.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && readChoice()) hide();
  });

  // Public reopener for the footer link / any [data-cookie-settings] trigger.
  window.openCookieConsent = show;

  // Delegated trigger: any element with [data-cookie-settings] reopens the banner
  // (e.g. the footer "Preferências de cookies" button). Least-invasive wiring.
  document.addEventListener('click', (e) => {
    const trigger = (e.target as Element | null)?.closest?.('[data-cookie-settings]');
    if (trigger) {
      e.preventDefault();
      show();
    }
  });

  // Decide initial visibility.
  if (!readChoice()) {
    show();
  } else {
    hide();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConsent);
} else {
  initConsent();
}
