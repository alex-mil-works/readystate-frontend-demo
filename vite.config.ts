import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Vite app config. Path aliases must match tsconfig. */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // Bind IPv4 so Playwright health checks on 127.0.0.1 work (macOS often prefers [::1]).
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@courses': path.resolve(__dirname, './.courses'),
    },
  },
});
