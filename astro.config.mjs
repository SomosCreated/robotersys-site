// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://robotersys.com',
  output: 'static',
  adapter: vercel({ imageService: false }),
  trailingSlash: 'always',
  integrations: [
    tailwind({ applyBaseStyles: false }), // base styles vêm do nosso global.css
    icon({ iconDir: 'src/icons' }),
  ],
  build: { inlineStylesheets: 'auto' },
});
