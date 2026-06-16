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
  // DDD 55 is unallocated in Brazil, so a 12/13-digit number starting with 55 is
  // treated as already carrying the country code (the form UX is local format).
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
