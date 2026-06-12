import { z } from 'zod';

export const contactSchema = z.object({
  type: z.enum(['contato', 'carreiras', 'produto']).default('contato'),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  whatsapp: z.string().min(8).max(20),
  message: z.string().max(2000).optional().default(''),
  // metadados (ocultos)
  company: z.string().optional(),            // produto
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  gclid: z.string().optional(),
  // honeypot — deve vir vazio
  website: z.string().max(0).optional().default(''),
  // tempo de preenchimento (ms) — muito rápido = bot
  _elapsed: z.coerce.number().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
