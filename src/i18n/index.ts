import type { Locale, Dict } from './types';
import pt from './pt';

const dicts: Partial<Record<Locale, Dict>> = { pt };

export function getDictionary(locale: Locale): Dict { return dicts[locale] ?? pt; }

export function t(locale: Locale, key: string): string {
  const dict = getDictionary(locale);
  const val = key.split('.').reduce<unknown>(
    (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
    dict,
  );
  return typeof val === 'string' ? val : key;
}
