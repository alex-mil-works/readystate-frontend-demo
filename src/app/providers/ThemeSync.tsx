import { useEffect } from 'react';

import { useThemeStore } from '@/shared/lib/store/theme-store';
import { applyThemeClass } from '@/shared/lib/theme/apply-theme';

/**
 * Maps Zustand `mode` to the `.dark` class on `<html>`.
 * In `system` mode, follows prefers-color-scheme.
 */
export function ThemeSync() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    document.documentElement.removeAttribute('data-palette');
    applyThemeClass(mode);

    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  return null;
}
