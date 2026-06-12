import threeD from './src/lib/tailwind-3d-plugin.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto Variable"', 'Roboto', 'sans-serif'],
        mono: ['"Roboto Mono Variable"', '"Roboto Mono"', 'monospace'],
      },
      colors: {
        // Semantic tokens — RGB channels, support /<alpha-value>
        bg:       'rgb(var(--color-bg) / <alpha-value>)',
        surface:  'rgb(var(--color-surface) / <alpha-value>)',
        elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
        line:     'rgb(var(--color-line) / <alpha-value>)',
        strong:   'rgb(var(--color-strong) / <alpha-value>)',
        base:     'rgb(var(--color-base) / <alpha-value>)',
        muted:    'rgb(var(--color-muted) / <alpha-value>)',
        accent:   'rgb(var(--color-accent) / <alpha-value>)',
        ok:       'rgb(var(--color-ok) / <alpha-value>)',
      },
    },
  },
  plugins: [threeD],
};
