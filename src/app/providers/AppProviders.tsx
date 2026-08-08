import type { ReactNode } from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

/** Composition root for app-wide providers (router, theme, etc.). */
export function AppProviders({ children }: AppProvidersProps) {
  return children;
}
