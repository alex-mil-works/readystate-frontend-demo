import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { resolveRoleStack } from '@/entities/discipline';

type WorkspacePrefsState = {
  lastRoleId: string | null;
  lastStackId: string | null;
  setLastWorkspace: (roleId: string, stackId: string) => void;
  clearLastWorkspace: () => void;
};

const STORAGE_KEY = 'readystate-workspace-prefs';

/** Last chosen role/stack (survives refresh; used by `/` and Logo). */
export const useWorkspacePrefsStore = create<WorkspacePrefsState>()(
  persist(
    (set) => ({
      lastRoleId: null,
      lastStackId: null,
      setLastWorkspace: (roleId, stackId) => {
        const { role, stack } = resolveRoleStack(roleId, stackId);
        if (!stack.available) return;
        set({ lastRoleId: role.id, lastStackId: stack.id });
      },
      clearLastWorkspace: () => set({ lastRoleId: null, lastStackId: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        lastRoleId: state.lastRoleId,
        lastStackId: state.lastStackId,
      }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === 'object'
            ? (persisted as { lastRoleId?: unknown; lastStackId?: unknown })
            : undefined;
        const lastRoleId = typeof raw?.lastRoleId === 'string' ? raw.lastRoleId : null;
        const lastStackId = typeof raw?.lastStackId === 'string' ? raw.lastStackId : null;
        if (!lastRoleId || !lastStackId) {
          return { ...current, lastRoleId: null, lastStackId: null };
        }
        const { role, stack } = resolveRoleStack(lastRoleId, lastStackId);
        if (!stack.available) {
          return { ...current, lastRoleId: null, lastStackId: null };
        }
        return { ...current, lastRoleId: role.id, lastStackId: stack.id };
      },
    },
  ),
);

/** Sync read after hydration — prefer store getters in React via hooks. */
export function getLastWorkspacePath(): { roleId: string; stackId: string } | null {
  const { lastRoleId, lastStackId } = useWorkspacePrefsStore.getState();
  if (!lastRoleId || !lastStackId) return null;
  const { role, stack } = resolveRoleStack(lastRoleId, lastStackId);
  if (!stack.available) return null;
  return { roleId: role.id, stackId: stack.id };
}
