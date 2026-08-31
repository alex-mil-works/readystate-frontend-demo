import { Outlet } from 'react-router';

import { AppLayout } from './AppLayout';

/** Chrome (header/theme) for home and settings. Lesson player is full-screen. */
export function AppChromeLayout({ hideSettings = false }: { hideSettings?: boolean }) {
  return (
    <AppLayout hideSettings={hideSettings}>
      <Outlet />
    </AppLayout>
  );
}
