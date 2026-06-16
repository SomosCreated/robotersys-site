import { defineMiddleware } from 'astro:middleware';

/**
 * Keystatic GitHub OAuth on Vercel — public-origin fix.
 *
 * Behind Vercel's reverse proxy the serverless function sees an internal host, so
 * Keystatic builds the GitHub `redirect_uri` as `https://localhost/...` and GitHub
 * rejects it ("redirect_uri is not associated with this application").
 *
 * For the Keystatic GitHub OAuth routes only, rebuild the request URL from Vercel's
 * `x-forwarded-host` / `x-forwarded-proto` headers (the real public origin), so
 * Keystatic generates the correct redirect_uri. No effect on any other route.
 *
 * Ref: Thinkmill/keystatic#1497 (Vercel proxy header handling).
 */
export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith('/api/keystatic/github/')) {
    const fwdHost = context.request.headers.get('x-forwarded-host');
    const fwdProto = context.request.headers.get('x-forwarded-proto');

    if (fwdHost) {
      const fixed = new URL(context.url);
      fixed.host = fwdHost;
      if (fwdProto) fixed.protocol = fwdProto;

      const method = context.request.method;
      const init: RequestInit & { duplex?: 'half' } = {
        method,
        headers: context.request.headers,
      };
      if (method !== 'GET' && method !== 'HEAD') {
        init.body = context.request.body;
        init.duplex = 'half';
      }

      Object.defineProperty(context, 'url', { value: fixed, configurable: true });
      Object.defineProperty(context, 'request', {
        value: new Request(fixed.toString(), init),
        configurable: true,
      });
    }
  }

  return next();
});
