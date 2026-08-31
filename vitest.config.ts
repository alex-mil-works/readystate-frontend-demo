import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Vitest: reuse Vite plugins/aliases; tests live in `__tests__/`. */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      globals: false,
      globalSetup: ['./__tests__/global-setup.ts'],
      setupFiles: ['./__tests__/setup.ts'],
      include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@courses': path.resolve(__dirname, './.courses'),
      },
    },
  }),
);
