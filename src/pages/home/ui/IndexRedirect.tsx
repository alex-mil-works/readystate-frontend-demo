import { Navigate } from 'react-router';

import { getLastWorkspacePath } from '@/shared/lib/store/workspace-prefs-store';
import { useWorkspacePrefsHydrated } from '@/shared/lib/use-workspace-prefs-hydrated';
import { AppBootSkeleton } from '@/shared/ui/kit';

import { homePathForRoleStack } from '@/features/select-role-stack';

/** `/` → last role/stack map, or onboarding when none saved. */
export function IndexRedirect() {
  const hydrated = useWorkspacePrefsHydrated();

  if (!hydrated) return <AppBootSkeleton />;

  const last = getLastWorkspacePath();
  if (!last) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to={homePathForRoleStack(last.roleId, last.stackId)} replace />;
}
