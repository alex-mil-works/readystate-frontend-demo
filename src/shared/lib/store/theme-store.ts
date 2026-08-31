import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type ThemeMode, parseThemePersist } from '@/shared/lib/validation/theme';

export type { ThemeMode };

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const THEME_STORAGE_KEY = 'readystate-theme';

/** localStorage adapter: invalid JSON is dropped. */
const themeStorage = createJSONStorage(() => ({
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (raw === null) return null;
    if (!parseThemePersist(raw)) {
      localStorage.removeItem(name);
      return null;
    }
    return raw;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
}));

/** Theme preference only. Lesson progress belongs in Dexie later. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: themeStorage,
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
