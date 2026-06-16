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

if (typeof document !== 'undefined') {
  document.addEventListener('rs:lead', onLead);
}
