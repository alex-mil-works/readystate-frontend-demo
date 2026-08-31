import { useEffect } from 'react';

import { useProgressStore } from '@/shared/lib/store/progress-store';

/** Load Dexie (and one-shot legacy localStorage migration) into the progress store. */
export function ProgressHydration() {
  const hydrate = useProgressStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
