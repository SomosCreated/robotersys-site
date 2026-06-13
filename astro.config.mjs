// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://robotersys.com',
  // Astro v5 uses 'static' for all output modes — hybrid mode was removed.
  // In v5, individual routes can export `prerender = false` to opt into
  // server rendering while the rest of the site stays static (SSG).
  // The Keystatic integration injects its /keystatic/[...params] and
  // /api/keystatic/[...params] routes with prerender=false automatically.
  output: 'static',
  adapter: vercel({ imageService: false }),
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'es', 'de'],
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  integrations: [
    react(),
    mdx(),
    keystatic(),
    tailwind({ applyBaseStyles: false }), // base styles vêm do nosso global.css
    icon({ iconDir: 'src/icons' }),
    sitemap({
      i18n: {
        defaultLocale: 'pt',
        locales: {
          pt: 'pt-BR',
          en: 'en',
          es: 'es',
          de: 'de',
        },
      },
    }),
  ],
  build: { inlineStylesheets: 'auto' },
});
