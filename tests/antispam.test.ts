import { describe, it, expect } from 'vitest';
import { isSpam } from '@/lib/antispam';

describe('isSpam', () => {
  it('bloqueia quando honeypot website está preenchido', () => {
    expect(isSpam({ website: 'http://spam.com' })).toBe(true);
  });

  it('bloqueia quando website tem qualquer conteúdo', () => {
    expect(isSpam({ website: 'x' })).toBe(true);
  });

  it('não bloqueia quando website está vazio', () => {
    expect(isSpam({ website: '' })).toBe(false);
  });

  it('não bloqueia quando website está undefined', () => {
    expect(isSpam({})).toBe(false);
  });

  it('bloqueia quando _elapsed < 1500ms (muito rápido = bot)', () => {
    expect(isSpam({ _elapsed: 1499 })).toBe(true);
  });

  it('bloqueia quando _elapsed é 0', () => {
    expect(isSpam({ _elapsed: 0 })).toBe(true);
  });

  it('não bloqueia quando _elapsed === 1500ms (no limite)', () => {
    expect(isSpam({ _elapsed: 1500 })).toBe(false);
  });

  it('não bloqueia quando _elapsed > 1500ms (humano normal)', () => {
    expect(isSpam({ _elapsed: 5000 })).toBe(false);
  });

  it('não bloqueia quando _elapsed está undefined', () => {
    expect(isSpam({ _elapsed: undefined })).toBe(false);
  });

  it('caso normal (humano) passa sem bloqueio', () => {
    expect(isSpam({ website: '', _elapsed: 3000 })).toBe(false);
  });

  it('bloqueia se ambos: honeypot + timing indicam bot', () => {
    expect(isSpam({ website: 'spam', _elapsed: 100 })).toBe(true);
  });
});
