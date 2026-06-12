import { describe, it, expect } from 'vitest';
import { buildPloomesContact } from '@/lib/ploomes';

describe('buildPloomesContact', () => {
  const baseInput = {
    type: 'contato' as const,
    name: 'Carlos Oliveira',
    email: 'carlos@example.com',
    whatsapp: '47988887777',
    message: 'Preciso de orçamento para manutenção.',
    website: '',
    message_default: '',
  };

  it('mapeia Name corretamente', () => {
    const payload = buildPloomesContact(baseInput);
    expect(payload.Name).toBe('Carlos Oliveira');
  });

  it('mapeia Email corretamente', () => {
    const payload = buildPloomesContact(baseInput);
    const emailField = payload.Emails?.find((e: { Address: string }) => e.Address === 'carlos@example.com');
    expect(emailField).toBeDefined();
  });

  it('mapeia WhatsApp no campo de telefone', () => {
    const payload = buildPloomesContact(baseInput);
    const phone = payload.Phones?.find((p: { PhoneNumber: string }) => p.PhoneNumber === '47988887777');
    expect(phone).toBeDefined();
  });

  it('inclui a mensagem em OtherProperties', () => {
    const payload = buildPloomesContact(baseInput);
    // Mensagem pode estar em OtherProperties ou Notes — verificar estrutura
    const messageField = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'message'
    );
    expect(messageField?.RawValue).toBe('Preciso de orçamento para manutenção.');
  });

  it('inclui type (origem do form) em OtherProperties', () => {
    const payload = buildPloomesContact(baseInput);
    const typeField = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'form_type'
    );
    expect(typeField?.RawValue).toBe('contato');
  });

  it('inclui utm_source quando fornecido', () => {
    const payload = buildPloomesContact({ ...baseInput, utm_source: 'google' });
    const utmField = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'utm_source'
    );
    expect(utmField?.RawValue).toBe('google');
  });

  it('inclui utm_medium quando fornecido', () => {
    const payload = buildPloomesContact({ ...baseInput, utm_medium: 'cpc' });
    const field = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'utm_medium'
    );
    expect(field?.RawValue).toBe('cpc');
  });

  it('inclui utm_campaign quando fornecido', () => {
    const payload = buildPloomesContact({ ...baseInput, utm_campaign: 'kuka-manutencao' });
    const field = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'utm_campaign'
    );
    expect(field?.RawValue).toBe('kuka-manutencao');
  });

  it('inclui gclid quando fornecido', () => {
    const payload = buildPloomesContact({ ...baseInput, gclid: 'CjwKCAiA9IC' });
    const field = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'gclid'
    );
    expect(field?.RawValue).toBe('CjwKCAiA9IC');
  });

  it('inclui company quando fornecido (tipo produto)', () => {
    const payload = buildPloomesContact({ ...baseInput, type: 'produto', company: 'IndústABC' });
    const field = payload.OtherProperties?.find(
      (p: { FieldKey: string }) => p.FieldKey === 'company'
    );
    expect(field?.RawValue).toBe('IndústABC');
  });

  it('não inclui campos UTM ausentes em OtherProperties', () => {
    const payload = buildPloomesContact(baseInput); // sem UTMs
    const utmFields = payload.OtherProperties?.filter(
      (p: { FieldKey: string }) => p.FieldKey.startsWith('utm_') || p.FieldKey === 'gclid'
    );
    expect(utmFields?.length).toBe(0);
  });
});
