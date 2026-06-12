import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the lib modules before importing the handler
vi.mock('@/lib/resend', () => ({
  sendLeadEmail: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock('@/lib/ploomes', () => ({
  createPloomesLead: vi.fn().mockResolvedValue({ ok: true }),
  buildPloomesContact: vi.fn(),
}));

import { sendLeadEmail } from '@/lib/resend';
import { createPloomesLead } from '@/lib/ploomes';
import { POST } from '@/pages/api/contact';

function makeFormDataRequest(fields: Record<string, string>) {
  const body = new URLSearchParams(fields).toString();
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

const validFields = {
  name: 'Ana Costa',
  email: 'ana@example.com',
  whatsapp: '47911112222',
  message: 'Olá, preciso de suporte.',
  type: 'contato',
  website: '',       // honeypot empty
  _elapsed: '4000', // ample time
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks return ok
    vi.mocked(sendLeadEmail).mockResolvedValue({ ok: true });
    vi.mocked(createPloomesLead).mockResolvedValue({ ok: true });
  });

  it('input válido → 200 {ok:true} e chama sendLeadEmail', async () => {
    const req = makeFormDataRequest(validFields);
    const res = await POST({ request: req } as never);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(sendLeadEmail).toHaveBeenCalledOnce();
  });

  it('input válido → também chama createPloomesLead', async () => {
    const req = makeFormDataRequest(validFields);
    await POST({ request: req } as never);
    expect(createPloomesLead).toHaveBeenCalledOnce();
  });

  it('honeypot preenchido → 200 silencioso sem chamar email', async () => {
    const req = makeFormDataRequest({ ...validFields, website: 'http://bot.io' });
    const res = await POST({ request: req } as never);

    expect(res.status).toBe(200);
    expect(sendLeadEmail).not.toHaveBeenCalled();
    expect(createPloomesLead).not.toHaveBeenCalled();
  });

  it('_elapsed < 1500ms (bot rápido) → 200 silencioso sem chamar email', async () => {
    const req = makeFormDataRequest({ ...validFields, _elapsed: '500' });
    const res = await POST({ request: req } as never);

    expect(res.status).toBe(200);
    expect(sendLeadEmail).not.toHaveBeenCalled();
  });

  it('email inválido → 400 com errors', async () => {
    const req = makeFormDataRequest({ ...validFields, email: 'nao-e-um-email' });
    const res = await POST({ request: req } as never);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.errors).toBeDefined();
  });

  it('name ausente → 400', async () => {
    const { name: _n, ...rest } = validFields;
    const req = makeFormDataRequest(rest);
    const res = await POST({ request: req } as never);

    expect(res.status).toBe(400);
  });

  it('type carreiras → 200 (rh destinatário não bloqueia)', async () => {
    const req = makeFormDataRequest({ ...validFields, type: 'carreiras' });
    const res = await POST({ request: req } as never);

    expect(res.status).toBe(200);
    expect(sendLeadEmail).toHaveBeenCalledOnce();
  });

  it('quando email retorna skipped (sem key) → ainda retorna 200', async () => {
    vi.mocked(sendLeadEmail).mockResolvedValue({ ok: false, skipped: 'no RESEND_API_KEY' });
    const req = makeFormDataRequest(validFields);
    const res = await POST({ request: req } as never);
    expect(res.status).toBe(200);
  });
});
