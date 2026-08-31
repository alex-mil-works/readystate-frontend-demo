import { Outlet } from 'react-router';

/** Root route shell. Child screens render through `<Outlet />`. */
export function RootLayout() {
  return (
    <div id="app-shell">
      <Outlet />
    </div>
  );
}
