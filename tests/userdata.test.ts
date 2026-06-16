import { describe, it, expect } from 'vitest';
import { normalizeEmail, normalizePhoneBR, buildUserData } from '@/lib/userdata';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Foo@Bar.COM ')).toBe('foo@bar.com');
  });
  it('returns undefined for empty or non-address input', () => {
    expect(normalizeEmail('')).toBeUndefined();
    expect(normalizeEmail(null)).toBeUndefined();
    expect(normalizeEmail('not-an-email')).toBeUndefined();
  });
});

describe('normalizePhoneBR', () => {
  it('formats a masked 11-digit mobile to E.164', () => {
    expect(normalizePhoneBR('(47) 99999-9999')).toBe('+5547999999999');
  });
  it('keeps an existing 55 country code', () => {
    expect(normalizePhoneBR('+55 47 99999-9999')).toBe('+5547999999999');
    expect(normalizePhoneBR('5547999999999')).toBe('+5547999999999');
  });
  it('handles a 10-digit landline', () => {
    expect(normalizePhoneBR('4733334444')).toBe('+554733334444');
  });
  it('returns undefined for implausible input', () => {
    expect(normalizePhoneBR('123')).toBeUndefined();
    expect(normalizePhoneBR('')).toBeUndefined();
  });
});

describe('buildUserData', () => {
  it('includes only present, normalized fields', () => {
    expect(buildUserData('A@B.com', '(47)99999-9999')).toEqual({
      email: 'a@b.com',
      phone_number: '+5547999999999',
    });
  });
  it('omits absent fields', () => {
    expect(buildUserData('', '')).toEqual({});
    expect(buildUserData('a@b.com', 'xx')).toEqual({ email: 'a@b.com' });
  });
});
