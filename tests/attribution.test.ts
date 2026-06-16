import { describe, it, expect } from 'vitest';
import { extractClickIds, readCookie } from '@/lib/attribution';

describe('extractClickIds', () => {
  it('extracts gclid', () => {
    expect(extractClickIds('?gclid=abc123&foo=1')).toEqual({ gclid: 'abc123' });
  });
  it('extracts wbraid and gbraid', () => {
    expect(extractClickIds('?wbraid=w1&gbraid=g1')).toEqual({ wbraid: 'w1', gbraid: 'g1' });
  });
  it('returns empty object when none present', () => {
    expect(extractClickIds('')).toEqual({});
    expect(extractClickIds('?utm_source=google')).toEqual({});
  });
});

describe('readCookie', () => {
  it('reads a named cookie value', () => {
    expect(readCookie('a=1; rs_gclid=xyz; b=2', 'rs_gclid')).toBe('xyz');
  });
  it('decodes URI-encoded values', () => {
    expect(readCookie('rs_gclid=a%20b', 'rs_gclid')).toBe('a b');
  });
  it('returns undefined when absent', () => {
    expect(readCookie('a=1', 'rs_gclid')).toBeUndefined();
    expect(readCookie('', 'rs_gclid')).toBeUndefined();
  });
});
