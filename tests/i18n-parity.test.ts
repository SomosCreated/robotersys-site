import { describe, it, expect } from 'vitest';
import pt from '@/i18n/pt';
import en from '@/i18n/en';
import es from '@/i18n/es';
import de from '@/i18n/de';

/**
 * Flatten a nested object into a set of dot-path leaf keys.
 * A leaf is any value that is not a plain object (i.e. a string).
 */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      for (const nested of flattenKeys(v as Record<string, unknown>, path)) {
        keys.add(nested);
      }
    } else {
      keys.add(path);
    }
  }
  return keys;
}

const ptKeys = flattenKeys(pt as unknown as Record<string, unknown>);

describe('i18n key parity — all locales must match PT (canonical)', () => {
  const locales: Array<{ name: string; dict: typeof en }> = [
    { name: 'en', dict: en },
    { name: 'es', dict: es },
    { name: 'de', dict: de },
  ];

  for (const { name, dict } of locales) {
    it(`${name} has exactly the same keys as pt`, () => {
      const localeKeys = flattenKeys(dict as unknown as Record<string, unknown>);

      const missingFromLocale = [...ptKeys].filter((k) => !localeKeys.has(k));
      const extraInLocale = [...localeKeys].filter((k) => !ptKeys.has(k));

      const messages: string[] = [];
      if (missingFromLocale.length > 0) {
        messages.push(
          `Keys present in PT but MISSING from ${name}:\n  ${missingFromLocale.join('\n  ')}`,
        );
      }
      if (extraInLocale.length > 0) {
        messages.push(
          `Keys present in ${name} but NOT in PT (extras):\n  ${extraInLocale.join('\n  ')}`,
        );
      }

      expect(messages, messages.join('\n\n')).toHaveLength(0);
    });
  }
});
