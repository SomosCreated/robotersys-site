import { Resend } from 'resend';
import type { ContactInput } from '@/lib/validation';

type LeadEmailInput = ContactInput & { _ploomesFailed?: boolean };

function renderLeadText(input: LeadEmailInput): string {
  const lines = [
    `Nome: ${input.name}`,
    `Email: ${input.email}`,
    `WhatsApp: ${input.whatsapp}`,
    input.company ? `Empresa: ${input.company}` : null,
    `Tipo: ${input.type}`,
    `Mensagem:\n${input.message ?? '(sem mensagem)'}`,
    '',
    '--- Origem / Rastreamento ---',
    input.utm_source ? `utm_source: ${input.utm_source}` : null,
    input.utm_medium ? `utm_medium: ${input.utm_medium}` : null,
    input.utm_campaign ? `utm_campaign: ${input.utm_campaign}` : null,
    input.gclid ? `gclid: ${input.gclid}` : null,
    '',
    input._ploomesFailed
      ? '⚠️  PLOOMES FALHOU — cadastrar este lead manualmente no CRM.'
      : 'Ploomes: OK',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

/**
 * Envia e-mail de notificação de lead via Resend.
 * Degrada graciosamente se RESEND_API_KEY não estiver configurada.
 */
export async function sendLeadEmail(
  input: LeadEmailInput,
  { to }: { to: string },
): Promise<{ ok: boolean; skipped?: string; error?: unknown }> {
  const key = import.meta.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: 'no RESEND_API_KEY' };

  const resend = new Resend(key);
  const flagged = input._ploomesFailed ? '⚠️ FALHA NO PLOOMES — cadastrar manualmente. ' : '';

  const { error } = await resend.emails.send({
    from: import.meta.env.RESEND_FROM ?? 'RoboterSys <site@robotersys.com.br>',
    to,
    subject: `${flagged}[${input.type}] Lead: ${input.name}`,
    text: renderLeadText(input),
  });

  return { ok: !error, error };
}
