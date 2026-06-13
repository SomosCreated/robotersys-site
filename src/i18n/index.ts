import type { Locale, Dict } from './types';
import pt from './pt';
import en from './en';
import es from './es';
import de from './de';

const dicts: Record<Locale, Dict> = { pt, en, es, de };

export function getDictionary(locale: Locale): Dict { return dicts[locale] ?? pt; }

export function t(locale: Locale, key: string): string {
  const dict = getDictionary(locale);
  const val = key.split('.').reduce<unknown>(
    (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
    dict,
  );
  if (typeof val === 'string') return val;
  // Fallback to PT if key is missing in the requested locale
  if (locale !== 'pt') {
    const ptVal = key.split('.').reduce<unknown>(
      (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
      pt,
    );
    if (typeof ptVal === 'string') return ptVal;
  }
  return key;
}
