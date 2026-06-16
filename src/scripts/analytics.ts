/**
 * analytics.ts — minimal, no-op-safe event helper + global click tracking.
 *
 * `pushEvent` pushes a GTM-style event onto window.dataLayer. If no measurement
 * is active (dataLayer never initialized by Analytics.astro because PUBLIC_GTM_ID
 * is unset), the pushes simply accumulate on a plain array and are harmless — no
 * network, no cookies. When GTM IS loaded it picks these events up normally.
 *
 * Keep this dependency-free and CSP-friendly (no eval, no external imports).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Push a GTM dataLayer event. Safe to call even when no analytics is loaded. */
export function pushEvent(event: string, params?: Record<string, unknown>): void {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...(params ?? {}) });
  } catch {
    /* never throw from a tracking call */
  }
}

/**
 * Delegated document-level click tracking for links that exist across many
 * pages/components. Idempotent — guarded so repeated imports attach once.
 *
 *   - phone_click    → any  a[href^="tel:"]
 *   - whatsapp_click → any  wa.me / chat.whatsapp.com / api.whatsapp.com link (covers contact-page
 *                      links in addition to the FloatingWhatsApp component, which
 *                      also fires its own push for redundancy/clarity).
 */
export function initGlobalTracking(): void {
  const w = window as Window & { __rsTrackingInit?: boolean };
  if (w.__rsTrackingInit) return;
  w.__rsTrackingInit = true;

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as Element | null;
      const link = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute('href') || '';

      if (href.startsWith('tel:')) {
        pushEvent('phone_click', { phone: href.replace(/^tel:/, '') });
        return;
      }

      if (/(?:wa\.me|chat\.whatsapp\.com|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(href)) {
        // The floating CTA fires its own richer whatsapp_click (source:floating_cta)
        // in floating-whatsapp.ts; skip it here to avoid a duplicate event.
        if (link.id === 'floating-whatsapp') return;
        pushEvent('whatsapp_click', { source: 'link' });
      }
    },
    { capture: true },
  );
}
