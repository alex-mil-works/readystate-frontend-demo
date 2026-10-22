/** Backend origin for curriculum JSON (`GET /v1/...`). */

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Local default: 127.0.0.1:3001. Production builds must set `VITE_CONTENT_API_URL`
 * (GitHub Variable → CI → `vercel build`); never ship localhost to Vercel.
 */
const configuredApiUrl = (import.meta.env.VITE_CONTENT_API_URL as string | undefined)?.trim();

if (import.meta.env.PROD) {
  if (!configuredApiUrl) {
    throw new Error('VITE_CONTENT_API_URL is required for production builds');
  }
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(configuredApiUrl)) {
    throw new Error(
      `VITE_CONTENT_API_URL must not be localhost in production (got ${configuredApiUrl})`,
    );
  }
}

export const CONTENT_API_URL = trimSlash(configuredApiUrl || 'http://127.0.0.1:3001');
