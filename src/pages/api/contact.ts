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
  // Read formData once; Zod strips unknown keys so `cv` (File) is handled separately.
  const fd = await request.formData();
  const data = Object.fromEntries(fd);

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

  // --- CV file (careers form only; optional) ---
  // Vercel serverless body limit is ~4.5 MB, so we cap the PDF at 4 MB to stay safe.
  const MAX_CV_BYTES = 4 * 1024 * 1024; // 4 MB
  let cvAttachment: { filename: string; content: Buffer } | undefined;
  const cvRaw = fd.get('cv');
  if (cvRaw instanceof File && cvRaw.size > 0) {
    const isPdf =
      cvRaw.type === 'application/pdf' || cvRaw.name.toLowerCase().endsWith('.pdf');
    if (!isPdf || cvRaw.size > MAX_CV_BYTES) {
      return json({ ok: false, errors: { cv: 'invalid' } }, 400);
    }
    const buf = Buffer.from(await cvRaw.arrayBuffer());
    // Sanitize filename: keep only safe characters
    const safeName = cvRaw.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    cvAttachment = { filename: safeName, content: buf };
  }

  const to =
    input.type === 'carreiras'
      ? (import.meta.env.CONTACT_TO_RH ?? '')
      : (import.meta.env.CONTACT_TO_COMMERCIAL ?? '');

  if (!to) return json({ ok: true }, 200);

  // TODO (Fase 5): IP rate-limit + Turnstile/BotID — tráfego pago
  const ploomes = await createPloomesLead(input);
  const email = await sendLeadEmail(
    { ...input, _ploomesFailed: !ploomes.ok },
    { to, attachment: cvAttachment },
  );

  const ok = email.ok || 'skipped' in email ? true : false;

  return json({ ok, ploomes: ploomes.ok }, 200);
};
