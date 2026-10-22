import { defineConfig } from '@playwright/test';

/**
 * Smoke / e2e against Vite + a local mock content API (fixtures).
 * macOS: system Google Chrome (`channel: 'chrome'`) — bundled Chromium is unsupported on macOS 12.
 * CI / Linux: Playwright's bundled Chromium (`playwright install chromium`).
 */
const useSystemChrome = process.platform === 'darwin';
const mockApiOrigin = 'http://127.0.0.1:3001';

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
  webServer: [
    {
      command: 'node e2e/mock-content-api.mjs',
      url: `${mockApiOrigin}/v1/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: process.env.CI ? 'yarn vite' : 'yarn dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_CONTENT_API_URL: mockApiOrigin,
        ...(process.env.VITE_SITE_PASSWORD
          ? { VITE_SITE_PASSWORD: process.env.VITE_SITE_PASSWORD }
          : {}),
      },
    },
  ],
});
