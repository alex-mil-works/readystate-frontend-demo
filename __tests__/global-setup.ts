import { execSync } from 'node:child_process';

/** Compile committed `courses-demo` once before Vitest so eager glob picks up bundles. */
export default function globalSetup() {
  execSync('yarn content:compile:demo', {
    stdio: 'inherit',
    env: {
      ...process.env,
      CONTENT_SOURCE: 'demo',
      VITE_CONTENT_SOURCE: 'demo',
      VITE_DEMO: 'true',
    },
  });
}
