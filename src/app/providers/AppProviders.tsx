import { RouterProvider } from 'react-router';

import { router } from '../router';
import { ProgressHydration } from './ProgressHydration';
import { SitePasswordGate } from './SitePasswordGate';
import { ThemeSync } from './ThemeSync';

/** Composition root: theme sync + progress hydrate + optional site gate + React Router. */
export function AppProviders() {
  return (
    <SitePasswordGate expectedPassword={import.meta.env.VITE_SITE_PASSWORD}>
      <ThemeSync />
      <ProgressHydration />
      <RouterProvider router={router} />
    </SitePasswordGate>
  );
}
