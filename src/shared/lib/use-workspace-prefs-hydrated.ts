import { useEffect, useState } from 'react';

import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';

/** True after zustand persist has rehydrated workspace prefs from localStorage. */
export function useWorkspacePrefsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useWorkspacePrefsStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useWorkspacePrefsStore.persist.onFinishHydration(() => setHydrated(true));
    if (useWorkspacePrefsStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}
