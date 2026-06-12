import type { ContactInput } from '@/lib/validation';

// CONFIRMAR com o cliente: mapeamento de funil, estágio e custom fields do Ploomes
const PLOOMES_CONFIG = {
  // PipelineId: null, // TODO: confirmar ID do funil
  // StageId: null,    // TODO: confirmar ID do estágio inicial
};

type OtherProperty = { FieldKey: string; RawValue: string };

export interface PloomesContactPayload {
  Name: string;
  Emails: { Address: string }[];
  Phones: { PhoneNumber: string }[];
  OtherProperties: OtherProperty[];
  [key: string]: unknown;
}

/**
 * Mapeamento puro: ContactInput → payload da API do Ploomes.
 * Testável sem rede.
 */
export function buildPloomesContact(input: Partial<ContactInput> & {
  name: string;
  email: string;
  whatsapp: string;
}): PloomesContactPayload {
  const otherProps: OtherProperty[] = [
    { FieldKey: 'form_type', RawValue: input.type ?? 'contato' },
    { FieldKey: 'message', RawValue: input.message ?? '' },
  ];

  if (input.company) otherProps.push({ FieldKey: 'company', RawValue: input.company });
  if (input.utm_source) otherProps.push({ FieldKey: 'utm_source', RawValue: input.utm_source });
  if (input.utm_medium) otherProps.push({ FieldKey: 'utm_medium', RawValue: input.utm_medium });
  if (input.utm_campaign) otherProps.push({ FieldKey: 'utm_campaign', RawValue: input.utm_campaign });
  if (input.gclid) otherProps.push({ FieldKey: 'gclid', RawValue: input.gclid });

  return {
    Name: input.name,
    Emails: [{ Address: input.email }],
    Phones: [{ PhoneNumber: input.whatsapp }],
    OtherProperties: otherProps,
    ...PLOOMES_CONFIG,
  };
}

/**
 * Envia o lead para o Ploomes CRM.
 * Degrada graciosamente se a PLOOMES_API_KEY não estiver configurada.
 */
export async function createPloomesLead(
  input: ContactInput,
): Promise<{ ok: boolean; skipped?: string; error?: unknown }> {
  const key = import.meta.env.PLOOMES_API_KEY;
  if (!key) return { ok: false, skipped: 'no PLOOMES_API_KEY' };

  const base = import.meta.env.PLOOMES_API_BASE ?? 'https://public-api2.ploomes.com';
  const payload = buildPloomesContact(input);

  try {
    const res = await fetch(`${base}/Contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Key': key,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[ploomes] lead failed:', `HTTP ${res.status}: ${body}`);
      return { ok: false, error: `HTTP ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[ploomes] lead failed:', err);
    return { ok: false, error: err };
  }
}
