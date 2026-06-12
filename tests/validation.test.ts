import { describe, it, expect } from 'vitest';
import { contactSchema } from '@/lib/validation';

describe('contactSchema', () => {
  const valid = {
    name: 'Maria Silva',
    email: 'maria@example.com',
    whatsapp: '47999999999',
    message: 'Preciso de suporte.',
  };

  it('aceita input mínimo válido (name/email/whatsapp obrigatórios)', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejeita quando name está ausente', () => {
    const { name: _n, ...rest } = valid;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejeita quando email está ausente', () => {
    const { email: _e, ...rest } = valid;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejeita quando whatsapp está ausente', () => {
    const { whatsapp: _w, ...rest } = valid;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'nao-e-email' });
    expect(result.success).toBe(false);
  });

  it('aceita mensagem opcional (ausente)', () => {
    const { message: _m, ...rest } = valid;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('type padrão é contato', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success && result.data.type).toBe('contato');
  });

  it('type aceita carreiras', () => {
    const result = contactSchema.safeParse({ ...valid, type: 'carreiras' });
    expect(result.success && result.data.type).toBe('carreiras');
  });

  it('type aceita produto', () => {
    const result = contactSchema.safeParse({ ...valid, type: 'produto' });
    expect(result.success && result.data.type).toBe('produto');
  });

  it('type inválido falha', () => {
    const result = contactSchema.safeParse({ ...valid, type: 'outro' });
    expect(result.success).toBe(false);
  });

  it('honeypot website preenchido → falha', () => {
    const result = contactSchema.safeParse({ ...valid, website: 'http://spam.com' });
    expect(result.success).toBe(false);
  });

  it('honeypot website vazio → sucesso', () => {
    const result = contactSchema.safeParse({ ...valid, website: '' });
    expect(result.success).toBe(true);
  });

  it('aceita campos opcionais (company, utm_source, gclid)', () => {
    const result = contactSchema.safeParse({
      ...valid,
      company: 'ACME',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'kuka-br',
      gclid: 'abc123',
    });
    expect(result.success).toBe(true);
  });

  it('_elapsed coerce de string para number', () => {
    const result = contactSchema.safeParse({ ...valid, _elapsed: '3000' });
    expect(result.success && typeof result.data._elapsed).toBe('number');
  });

  it('rejeita name muito curto (< 2 chars)', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejeita name muito longo (> 120 chars)', () => {
    const result = contactSchema.safeParse({ ...valid, name: 'A'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('rejeita whatsapp muito curto (< 8 chars)', () => {
    const result = contactSchema.safeParse({ ...valid, whatsapp: '1234567' });
    expect(result.success).toBe(false);
  });
});
