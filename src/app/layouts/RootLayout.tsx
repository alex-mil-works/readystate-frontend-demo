import { Outlet } from 'react-router';

import { ProgressNavigationFlush } from '@/app/providers/ProgressNavigationFlush';

/** Root route shell. Child screens render through `<Outlet />`. */
export function RootLayout() {
  return (
    <div id="app-shell">
      <ProgressNavigationFlush />
      <Outlet />
    </div>
  );
}
