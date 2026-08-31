import { Navigate, Outlet } from 'react-router';

import { getLastWorkspacePath } from '@/shared/lib/store/workspace-prefs-store';
import { useWorkspacePrefsHydrated } from '@/shared/lib/use-workspace-prefs-hydrated';
import { AppBootSkeleton } from '@/shared/ui/kit';

/**
 * Blocks map / lessons / settings until a last role/stack exists.
 * Password is enforced outside the router by SitePasswordGate.
 */
export function RequireWorkspace() {
  const hydrated = useWorkspacePrefsHydrated();

  if (!hydrated) return <AppBootSkeleton />;

  if (!getLastWorkspacePath()) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
