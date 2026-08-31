import { defineConfig } from '@playwright/test';

/**
 * Smoke / e2e against the Vite dev server.
 * macOS: system Google Chrome (`channel: 'chrome'`) — bundled Chromium is unsupported on macOS 12.
 * CI / Linux: Playwright's bundled Chromium (`playwright install chromium`).
 * CI compiles `courses-demo` before tests and runs `yarn vite` (skip predev re-compile without env).
 */
const useSystemChrome = process.platform === 'darwin';

const demoWebServerEnv: Record<string, string> = {
  CONTENT_SOURCE: 'demo',
  VITE_CONTENT_SOURCE: 'demo',
  VITE_DEMO: 'true',
  ...(process.env.VITE_SITE_PASSWORD ? { VITE_SITE_PASSWORD: process.env.VITE_SITE_PASSWORD } : {}),
};

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    ...(useSystemChrome ? { channel: 'chrome' as const } : {}),
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: process.env.CI ? 'yarn vite' : 'yarn dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: process.env.CI ? demoWebServerEnv : undefined,
  },
});
