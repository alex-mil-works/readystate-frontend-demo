import type { ThemeMode } from '@/shared/lib/validation/theme';

/** Whether `<html>` should have `.dark`. */
export function resolveDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Toggle `.dark` on documentElement. */
export function applyThemeClass(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', resolveDark(mode));
}
