import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: {
    alias: {
      '@': decodeURIComponent(new URL('./src', import.meta.url).pathname),
    },
  },
});
