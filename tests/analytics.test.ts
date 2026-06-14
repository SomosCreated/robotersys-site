import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pushEvent } from '@/scripts/analytics';

/**
 * pushEvent is the no-op-safe measurement primitive. It must:
 *  - lazily create window.dataLayer,
 *  - push a well-formed {event, ...params} object,
 *  - never throw (even if window is missing / storage blocked).
 */
describe('pushEvent', () => {
  const hadWindow = 'window' in globalThis;
  const originalWindow = (globalThis as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as { window?: unknown }).window = {} as Window & typeof globalThis;
  });

  afterEach(() => {
    if (hadWindow) {
      (globalThis as { window?: unknown }).window = originalWindow;
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
  });

  it('creates dataLayer and pushes a well-formed event', () => {
    pushEvent('generate_lead', { form_variant: 'contato' });
    const dl = (globalThis as unknown as { window: { dataLayer: unknown[] } }).window.dataLayer;
    expect(Array.isArray(dl)).toBe(true);
    expect(dl[0]).toEqual({ event: 'generate_lead', form_variant: 'contato' });
  });

  it('appends to an existing dataLayer without clobbering it', () => {
    (globalThis as unknown as { window: { dataLayer: unknown[] } }).window.dataLayer = [{ event: 'gtm.js' }];
    pushEvent('whatsapp_click');
    const dl = (globalThis as unknown as { window: { dataLayer: unknown[] } }).window.dataLayer;
    expect(dl).toHaveLength(2);
    expect(dl[1]).toEqual({ event: 'whatsapp_click' });
  });

  it('never throws when window is unavailable', () => {
    delete (globalThis as { window?: unknown }).window;
    expect(() => pushEvent('phone_click')).not.toThrow();
  });
});
