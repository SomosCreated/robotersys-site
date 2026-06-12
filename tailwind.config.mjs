import threeD from './src/lib/tailwind-3d-plugin.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // aliases semânticos (apontam para o Tailwind padrão da referência)
        ink: '#050505',      // fundo base
        surface: '#080808',  // superfície
        accent: '#ea580c',   // orange-600 (≈ laranja KUKA)
      },
    },
  },
  plugins: [threeD],
};
