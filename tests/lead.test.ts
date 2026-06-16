import { describe, it, expect } from 'vitest';
import { buildLeadEvent } from '@/scripts/lead';

describe('buildLeadEvent', () => {
  it('includes user_data when email/phone are valid', () => {
    expect(buildLeadEvent({ variant: 'produto', email: 'A@B.com', phone: '(47)99999-9999' })).toEqual({
      event: 'generate_lead',
      form_variant: 'produto',
      user_data: { email: 'a@b.com', phone_number: '+5547999999999' },
    });
  });
  it('omits user_data when no valid PII', () => {
    expect(buildLeadEvent({ variant: 'contato' })).toEqual({
      event: 'generate_lead',
      form_variant: 'contato',
    });
  });
  it('defaults the variant', () => {
    expect(buildLeadEvent({})).toEqual({ event: 'generate_lead', form_variant: 'contato' });
  });
});
