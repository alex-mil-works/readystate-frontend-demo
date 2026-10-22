import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';

import { flushProgressWrites, hasPendingProgressWrites } from '@/shared/lib/store/progress-store';

/**
 * In-app navigations wait until the Dexie queue finishes.
 * Tab hide still kicks the same queue from the store (best effort).
 */
export function ProgressNavigationFlush() {
  const blocker = useBlocker(() => hasPendingProgressWrites());
  const proceedRef = useRef<(() => void) | undefined>(undefined);
  proceedRef.current = blocker.state === 'blocked' ? blocker.proceed : undefined;

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    void flushProgressWrites().finally(() => {
      proceedRef.current?.();
    });
  }, [blocker.state]);

  return null;
}
