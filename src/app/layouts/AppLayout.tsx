import type { ReactNode } from 'react';
import { Link } from 'react-router';

import ComputerIcon from '@hugeicons/core-free-icons/ComputerIcon';
import Moon01Icon from '@hugeicons/core-free-icons/Moon01Icon';
import Settings01Icon from '@hugeicons/core-free-icons/Settings01Icon';
import Sun01Icon from '@hugeicons/core-free-icons/Sun01Icon';

import { APP_NAME, APP_SHELL_WIDTH_CLASS, APP_TAGLINE } from '@/shared/config';
import { type ThemeMode, useThemeStore } from '@/shared/lib/store/theme-store';
import { AppBrand, Button, Icon } from '@/shared/ui/kit';

/** Home workspace and settings chrome. Lesson playback uses its own layout. */
export function AppLayout({
  children,
  hideSettings = false,
}: {
  children: ReactNode;
  /** Soft 404: keep theme + brand home, hide settings (RequireWorkspace). */
  hideSettings?: boolean;
}) {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: typeof Sun01Icon }> = [
    { mode: 'light', label: 'Светлая тема', icon: Sun01Icon },
    { mode: 'dark', label: 'Тёмная тема', icon: Moon01Icon },
    { mode: 'system', label: 'Системная тема', icon: ComputerIcon },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border w-full border-b">
        <div
          className={`${APP_SHELL_WIDTH_CLASS} flex items-center justify-between gap-2 py-3 sm:gap-4`}
        >
          <Link
            to="/"
            className="min-w-0 no-underline select-none"
            title={`${APP_NAME} | ${APP_TAGLINE}`}
          >
            <AppBrand showDemoBadge collapseTaglineOnNarrow />
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="border-border bg-card/80 flex items-center gap-0.5 rounded-full border p-0.5 sm:gap-1 sm:p-1">
              {themeOptions.map((option) => (
                <Button
                  key={option.mode}
                  type="button"
                  size="icon-sm"
                  variant={mode === option.mode ? 'default' : 'ghost'}
                  aria-label={option.label}
                  aria-pressed={mode === option.mode}
                  title={option.label}
                  onClick={() => setMode(option.mode)}
                >
                  <Icon icon={option.icon} size={16} />
                </Button>
              ))}
            </div>

            {hideSettings ? null : (
              <Button
                variant="outline"
                size="sm"
                className="px-2.5 sm:px-3"
                aria-label="Настройки"
                title="Настройки"
                nativeButton={false}
                render={<Link to="/settings" />}
              >
                <Icon icon={Settings01Icon} size={16} className="sm:hidden" />
                <span className="hidden sm:inline">Настройки</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className={`${APP_SHELL_WIDTH_CLASS} py-6 sm:py-8`}>{children}</div>
      </main>
    </div>
  );
}
