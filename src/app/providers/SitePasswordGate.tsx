import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { isSiteGateUnlocked, subscribeSiteGate, unlockSiteGate } from '@/shared/lib/site-gate';
import { AppBrandHeading, Button } from '@/shared/ui/kit';

import { router } from '../router';

/** Soft client-side gate. Password lives in the bundle — not real security. */
export function SitePasswordGate({
  expectedPassword,
  children,
}: {
  expectedPassword?: string;
  children: ReactNode;
}) {
  const required = Boolean(expectedPassword);
  const [unlocked, setUnlocked] = useState(() => {
    if (!required) return true;
    return isSiteGateUnlocked();
  });
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!required) return;
    return subscribeSiteGate(() => {
      if (isSiteGateUnlocked()) {
        setUnlocked(true);
        return;
      }
      // Park on `/` before hiding the app so unlock lands on IndexRedirect → primary.
      void router.navigate('/', { replace: true }).finally(() => {
        setUnlocked(false);
      });
    });
  }, [required]);

  if (!required || unlocked) return children;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <AppBrandHeading size="lg" />
        <form
          className="mt-6 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (value !== expectedPassword) {
              setError(true);
              return;
            }
            setError(false);
            setValue('');
            // Ensure `/` before remounting the router (logout may already have done this).
            void router.navigate('/', { replace: true }).finally(() => {
              unlockSiteGate();
            });
          }}
        >
          <label className="text-foreground text-sm font-medium" htmlFor="site-password">
            Пароль
          </label>
          <input
            id="site-password"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(false);
            }}
            className="border-input bg-background text-foreground h-9 w-full rounded-4xl border px-3 text-sm outline-none"
            aria-invalid={error || undefined}
          />
          {error ? (
            <p className="text-destructive m-0 text-sm" role="alert">
              Неверный пароль
            </p>
          ) : null}
          <Button type="submit">Войти</Button>
        </form>
      </div>
    </div>
  );
}
