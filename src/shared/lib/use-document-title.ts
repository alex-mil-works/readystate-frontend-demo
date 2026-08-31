import { useEffect } from 'react';

import { APP_NAME } from '@/shared/config';

/** Sets `document.title` to `Title · ReadyState` (or just the app name). */
export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    const previous = document.title;
    document.title = title?.trim() ? `${title.trim()} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
