import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Layout of lesson tiles inside a unit. */
export type UnitItemsLayout = 'micro-3' | 'list';

type UiPrefsState = {
  unitItemsLayout: UnitItemsLayout;
  setUnitItemsLayout: (layout: UnitItemsLayout) => void;
  /** `${courseId}:${stageId}` → expanded. Missing key uses default (filled open, empty closed). */
  stageExpanded: Record<string, boolean>;
  setStageExpanded: (key: string, expanded: boolean) => void;
  patchStageExpanded: (patch: Record<string, boolean>) => void;
};

const UI_PREFS_STORAGE_KEY = 'readystate-ui-prefs';

function normalizeUnitItemsLayout(value: unknown): UnitItemsLayout {
  if (value === 'list') return value;
  return 'micro-3';
}

/** Ephemeral layout prefs (unit tile density + stage expand state). */
export const useUiPrefsStore = create<UiPrefsState>()(
  persist(
    (set) => ({
      unitItemsLayout: 'micro-3',
      setUnitItemsLayout: (unitItemsLayout) => set({ unitItemsLayout }),
      stageExpanded: {},
      setStageExpanded: (key, expanded) =>
        set((state) => ({
          stageExpanded: { ...state.stageExpanded, [key]: expanded },
        })),
      patchStageExpanded: (patch) =>
        set((state) => ({
          stageExpanded: { ...state.stageExpanded, ...patch },
        })),
    }),
    {
      name: UI_PREFS_STORAGE_KEY,
      partialize: (state) => ({
        unitItemsLayout: state.unitItemsLayout,
        stageExpanded: state.stageExpanded,
      }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === 'object'
            ? (persisted as {
                unitItemsLayout?: unknown;
                stageExpanded?: unknown;
              })
            : undefined;
        const stageExpanded =
          raw?.stageExpanded && typeof raw.stageExpanded === 'object'
            ? (raw.stageExpanded as Record<string, boolean>)
            : current.stageExpanded;
        return {
          ...current,
          unitItemsLayout: normalizeUnitItemsLayout(
            raw?.unitItemsLayout ?? current.unitItemsLayout,
          ),
          stageExpanded,
        };
      },
    },
  ),
);
