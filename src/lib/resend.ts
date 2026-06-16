import { Resend } from 'resend';
import type { ContactInput } from '@/lib/validation';

type LeadEmailInput = ContactInput & { _ploomesFailed?: boolean };

/** Escape user-provided text before interpolating into HTML (email-injection guard). */
function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TYPE_LABEL: Record<string, string> = {
  contato: 'Contato',
  produto: 'Consulta de produto',
  carreiras: 'Trabalhe conosco',
};

/** Plain-text fallback (multipart) — also the body when no HTML client. */
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
    '',
    'Responda este e-mail para falar direto com o lead.',
    'Site desenvolvido por CREATED — created.com.br',
  ];
  return lines.filter((l) => l !== null).join('\n');
}

/** Branded HTML lead-notification email — RoboterSys style, CREATED signature. */
function renderLeadHtml(input: LeadEmailInput): string {
  const waDigits = String(input.whatsapp ?? '').replace(/\D/g, '');
  const typeLabel = TYPE_LABEL[input.type] ?? esc(input.type);

  const row = (label: string, valueHtml: string) =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #ededf0;font:600 12px/1.4 Arial,Helvetica,sans-serif;color:#71717a;text-transform:uppercase;letter-spacing:.5px;width:120px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #ededf0;font:400 14px/1.55 Arial,Helvetica,sans-serif;color:#18181b;vertical-align:top;">${valueHtml}</td>
    </tr>`;

  const rows = [
    row('E-mail', `<a href="mailto:${esc(input.email)}" style="color:#ff5a1f;text-decoration:none;">${esc(input.email)}</a>`),
    row('WhatsApp', `<a href="https://wa.me/${waDigits}" style="color:#ff5a1f;text-decoration:none;">${esc(input.whatsapp)}</a>`),
    input.company ? row('Empresa', esc(input.company)) : '',
    input.message ? row('Mensagem', esc(input.message).replace(/\n/g, '<br>')) : '',
  ].join('');

  const tracking = [
    input.utm_source ? `utm_source: ${esc(input.utm_source)}` : '',
    input.utm_medium ? `utm_medium: ${esc(input.utm_medium)}` : '',
    input.utm_campaign ? `utm_campaign: ${esc(input.utm_campaign)}` : '',
    input.gclid ? `gclid: ${esc(input.gclid)}` : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  const ploomesWarn = input._ploomesFailed
    ? `<tr><td style="background:#fef2f2;color:#b91c1c;font:600 13px Arial,Helvetica,sans-serif;padding:12px 28px;border-bottom:1px solid #fecaca;">⚠️ Falha ao enviar ao Ploomes — cadastre este lead manualmente no CRM.</td></tr>`
    : '';

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="background:#0a0a0a;padding:22px 28px;">
          <span style="font:700 22px Arial,Helvetica,sans-serif;color:#ffffff;letter-spacing:-.5px;">RoboterSys<span style="color:#ff5a1f;">.</span></span>
          <div style="font:600 11px Arial,Helvetica,sans-serif;color:#a1a1aa;text-transform:uppercase;letter-spacing:2px;margin-top:6px;">Novo lead pelo site &nbsp;·&nbsp; ${typeLabel}</div>
        </td></tr>
        ${ploomesWarn}
        <tr><td style="padding:26px 28px 6px;">
          <div style="font:700 20px Arial,Helvetica,sans-serif;color:#0a0a0a;margin:0 0 16px;">${esc(input.name)}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        <tr><td style="padding:18px 28px 4px;">
          <div style="background:#fff7ed;border-left:3px solid #ff5a1f;border-radius:4px;padding:12px 14px;font:400 13px/1.5 Arial,Helvetica,sans-serif;color:#7c2d12;">
            Responda este e-mail para falar direto com <strong>${esc(input.name)}</strong> — a resposta vai para ${esc(input.email)}.
          </div>
        </td></tr>
        ${tracking ? `<tr><td style="padding:12px 28px 0;"><div style="font:400 11px/1.6 Arial,Helvetica,sans-serif;color:#a1a1aa;">Origem &nbsp; ${tracking}</div></td></tr>` : ''}
        <tr><td style="padding:22px 28px;">
          <div style="border-top:1px solid #e4e4e7;padding-top:16px;font:400 11px/1.6 Arial,Helvetica,sans-serif;color:#a1a1aa;">
            Notificação automática de <strong style="color:#71717a;">robotersys.com</strong>.<br>
            Site desenvolvido e mantido por <a href="https://created.com.br" style="color:#71717a;text-decoration:underline;">CREATED</a>.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export interface LeadEmailOpts {
  to: string;
  /** Optional PDF attachment (CV upload from careers form). */
  attachment?: { filename: string; content: Buffer };
}

/**
 * Envia e-mail de notificação de lead via Resend.
 * - from: domínio verificado (created.com.br) — ver RESEND_FROM.
 * - replyTo: e-mail de quem preencheu o formulário (resposta vai direto ao lead).
 * - HTML branded RoboterSys + assinatura CREATED; text/plain como fallback.
 * Degrada graciosamente se RESEND_API_KEY não estiver configurada.
 */
export async function sendLeadEmail(
  input: LeadEmailInput,
  { to, attachment }: LeadEmailOpts,
): Promise<{ ok: boolean; skipped?: string; error?: unknown }> {
  const key = import.meta.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: 'no RESEND_API_KEY' };

  const resend = new Resend(key);
  const flagged = input._ploomesFailed ? '⚠️ FALHA NO PLOOMES — cadastrar manualmente. ' : '';

  // SDK returns { data, error } (does not throw) — check error explicitly.
  const { error } = await resend.emails.send({
    from: import.meta.env.RESEND_FROM ?? 'RoboterSys <hello@created.com.br>',
    to,
    replyTo: input.email,
    subject: `${flagged}[${input.type}] Lead: ${input.name}`,
    text: renderLeadText(input),
    html: renderLeadHtml(input),
    ...(attachment
      ? {
          attachments: [
            { filename: attachment.filename, content: attachment.content },
          ],
        }
      : {}),
  });

  if (error) console.error('[resend] send failed:', error);
  return { ok: !error, error };
}
