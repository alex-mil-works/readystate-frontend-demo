import { RouterProvider } from 'react-router';

import { router } from '../router';
import { ContentBootstrap } from './ContentBootstrap';
import { ProgressHydration } from './ProgressHydration';
import { SitePasswordGate } from './SitePasswordGate';
import { ThemeSync } from './ThemeSync';

/** Composition root: content load + theme + progress + optional site gate + React Router. */
export function AppProviders() {
  return (
    <SitePasswordGate expectedPassword={import.meta.env.VITE_SITE_PASSWORD}>
      <ThemeSync />
      <ProgressHydration />
      <ContentBootstrap>
        <RouterProvider router={router} />
      </ContentBootstrap>
    </SitePasswordGate>
  );
}
