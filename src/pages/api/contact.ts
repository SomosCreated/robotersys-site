export const prerender = false;

import type { APIRoute } from 'astro';
import { contactSchema } from '@/lib/validation';
import { isSpam } from '@/lib/antispam';
import { createPloomesLead } from '@/lib/ploomes';
import { sendLeadEmail } from '@/lib/resend';

const json = (b: unknown, s: number) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const data = Object.fromEntries(await request.formData());

  // Check antispam on raw data BEFORE schema validation to avoid leaking
  // validation behaviour to bots (honeypot filled OR too fast → silent 200)
  const rawWebsite = typeof data.website === 'string' ? data.website : '';
  const rawElapsed = data._elapsed !== undefined ? Number(data._elapsed) : undefined;
  if (isSpam({ website: rawWebsite, _elapsed: rawElapsed })) {
    return json({ ok: true }, 200);
  }

  const parsed = contactSchema.safeParse(data);

  if (!parsed.success) {
    return json({ ok: false, errors: parsed.error.flatten() }, 400);
  }

  const input = parsed.data;

  const to =
    input.type === 'carreiras'
      ? (import.meta.env.CONTACT_TO_RH ?? '')
      : (import.meta.env.CONTACT_TO_COMMERCIAL ?? '');

  if (!to) return json({ ok: true }, 200);

  // TODO (Fase 5): IP rate-limit + Turnstile/BotID — tráfego pago
  const ploomes = await createPloomesLead(input);
  const email = await sendLeadEmail({ ...input, _ploomesFailed: !ploomes.ok }, { to });

  const ok = email.ok || 'skipped' in email ? true : false;

  return json({ ok, ploomes: ploomes.ok }, 200);
};
