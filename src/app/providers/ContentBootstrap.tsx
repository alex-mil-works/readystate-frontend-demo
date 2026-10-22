import { type ReactNode, useEffect, useState } from 'react';

import { loadRemoteContent } from '@/shared/content/load-remote';

type Status = 'loading' | 'ready' | 'error';

/** Load course JSON from the backend before the router mounts (Dexie progress is unchanged). */
export function ContentBootstrap({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRemoteContent()
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center p-6 text-sm">
        Загрузка курсов…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-destructive text-sm font-medium">Не удалось загрузить контент</p>
        <p className="text-muted-foreground max-w-md text-xs whitespace-pre-wrap">{error}</p>
        <p className="text-muted-foreground max-w-md text-xs">
          Проверьте <code className="font-mono">VITE_CONTENT_API_URL</code>, CORS на API и{' '}
          <code className="font-mono">GET /v1/health</code> (должен быть{' '}
          <code className="font-mono">ok: true</code>
          ).
        </p>
      </div>
    );
  }

  return children;
}
