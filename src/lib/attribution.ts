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
