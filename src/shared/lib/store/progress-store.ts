import { create } from 'zustand';

import { nextDueAt } from '@/shared/lib/engine';
import { MAX_SHOWN_RECALL_KEYS } from '@/shared/lib/progress/convert';
import type { CourseProgressRecord, RecallItemState } from '@/shared/lib/progress/progress-types';
import {
  clearAllProgress,
  deleteCourseRecord,
  exportProgressJson,
  hydrateProgressWithLegacyMigration,
  importProgressJson,
  loadAllRecords,
  saveCourseRecord,
} from '@/shared/lib/progress/repository';

type ProgressState = {
  byCourseId: Record<string, CourseProgressRecord>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markLessonStarted: (input: {
    courseId: string;
    roleId: string;
    stackId: string;
    title: string;
    lessonId: string;
  }) => void;
  markLessonCompleted: (input: {
    courseId: string;
    roleId: string;
    stackId: string;
    title: string;
    lessonId: string;
  }) => void;
  markRecallShown: (
    courseId: string,
    keys: string[],
    meta?: { roleId: string; stackId: string; title: string },
  ) => void;
  resetCourse: (courseId: string) => void;
  resetAll: () => void;
  /** Replace-all from portable JSON; reloads store from Dexie. */
  importFromJson: (raw: string) => Promise<void>;
  exportToJson: () => Promise<string>;
};

function uniquePush(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids : [...ids, id];
}

function upsertRecord(
  current: CourseProgressRecord | undefined,
  input: {
    courseId: string;
    roleId: string;
    stackId: string;
    title: string;
  },
): CourseProgressRecord {
  return {
    courseId: input.courseId,
    roleId: input.roleId,
    stackId: input.stackId,
    title: input.title,
    startedLessonIds: current?.startedLessonIds ?? [],
    completedLessonIds: current?.completedLessonIds ?? [],
    lessonTimes: current?.lessonTimes ?? {},
    shownRecallKeys: current?.shownRecallKeys ?? [],
    recallItems: current?.recallItems ?? {},
    updatedAt: Date.now(),
  };
}

let writeQueue: Promise<void> = Promise.resolve();
let pendingWrites = 0;

function trackWrite(work: () => Promise<void>): void {
  pendingWrites += 1;
  writeQueue = writeQueue
    .then(work)
    .catch((error: unknown) => {
      console.error('Failed to persist progress to Dexie', error);
    })
    .finally(() => {
      pendingWrites -= 1;
    });
}

function persistRecord(record: CourseProgressRecord): void {
  trackWrite(() => saveCourseRecord(record));
}

function enqueueWrite(work: () => Promise<void>): void {
  trackWrite(work);
}

/** True while a Dexie write is queued or in flight. */
export function hasPendingProgressWrites(): boolean {
  return pendingWrites > 0;
}

/** Await pending Dexie writes (navigation, tests, export). */
export function flushProgressWrites(): Promise<void> {
  return writeQueue;
}

function installProgressLeaveFlush(): void {
  if (typeof window === 'undefined') return;
  const kick = () => {
    void flushProgressWrites();
  };
  window.addEventListener('pagehide', kick);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') kick();
  });
}

installProgressLeaveFlush();

function scheduleAfterShow(existing: RecallItemState | undefined, now: number): RecallItemState {
  const showCount = (existing?.showCount ?? 0) + 1;
  return {
    lastShownAt: now,
    showCount,
    dueAt: nextDueAt(showCount, now),
  };
}

/** In-memory progress cache; Dexie is the source of truth after hydrate. */
export const useProgressStore = create<ProgressState>()((set, get) => ({
  byCourseId: {},
  hydrated: false,

  hydrate: async () => {
    const byCourseId = await hydrateProgressWithLegacyMigration();
    set({ byCourseId, hydrated: true });
  },

  markLessonStarted: (input) => {
    const current = upsertRecord(get().byCourseId[input.courseId], input);
    const now = Date.now();
    const existingTimes = current.lessonTimes[input.lessonId];
    const isCompleted = current.completedLessonIds.includes(input.lessonId);
    const alreadyTracked = isCompleted || current.startedLessonIds.includes(input.lessonId);
    const metaUnchanged =
      current.title === input.title &&
      current.roleId === input.roleId &&
      current.stackId === input.stackId;

    // Completed: keep completedAt stable until markLessonCompleted.
    // In progress: refresh startedAt so warmth stays hot while studying.
    if (alreadyTracked && metaUnchanged && existingTimes?.startedAt !== undefined) {
      if (isCompleted) return;

      const next = {
        ...current,
        lessonTimes: {
          ...current.lessonTimes,
          [input.lessonId]: {
            startedAt: now,
            completedAt: existingTimes.completedAt,
          },
        },
        updatedAt: now,
      };
      set({
        byCourseId: { ...get().byCourseId, [input.courseId]: next },
      });
      persistRecord(next);
      return;
    }

    const lessonTimes = {
      ...current.lessonTimes,
      [input.lessonId]: {
        startedAt: existingTimes?.startedAt ?? now,
        completedAt: existingTimes?.completedAt,
      },
    };

    if (alreadyTracked) {
      const next = {
        ...current,
        title: input.title,
        roleId: input.roleId,
        stackId: input.stackId,
        lessonTimes,
        updatedAt: now,
      };
      set({
        byCourseId: { ...get().byCourseId, [input.courseId]: next },
      });
      persistRecord(next);
      return;
    }

    const next = {
      ...current,
      startedLessonIds: uniquePush(current.startedLessonIds, input.lessonId),
      lessonTimes,
      updatedAt: now,
    };
    set({
      byCourseId: { ...get().byCourseId, [input.courseId]: next },
    });
    persistRecord(next);
  },

  markLessonCompleted: (input) => {
    const current = upsertRecord(get().byCourseId[input.courseId], input);
    const now = Date.now();
    const existingTimes = current.lessonTimes[input.lessonId];
    const next = {
      ...current,
      startedLessonIds: uniquePush(current.startedLessonIds, input.lessonId),
      completedLessonIds: uniquePush(current.completedLessonIds, input.lessonId),
      lessonTimes: {
        ...current.lessonTimes,
        [input.lessonId]: {
          startedAt: existingTimes?.startedAt ?? now,
          completedAt: now,
        },
      },
      updatedAt: now,
    };
    set({
      byCourseId: { ...get().byCourseId, [input.courseId]: next },
    });
    persistRecord(next);
  },

  markRecallShown: (courseId, keys, meta) => {
    if (keys.length === 0) return;
    const existing =
      get().byCourseId[courseId] ??
      (meta
        ? upsertRecord(undefined, {
            courseId,
            roleId: meta.roleId,
            stackId: meta.stackId,
            title: meta.title,
          })
        : undefined);
    if (!existing) return;
    const now = Date.now();
    const recallItems = { ...existing.recallItems };
    for (const key of keys) {
      recallItems[key] = scheduleAfterShow(recallItems[key], now);
    }
    const merged = [...keys, ...existing.shownRecallKeys];
    const deduped: string[] = [];
    for (const key of merged) {
      if (!deduped.includes(key)) deduped.push(key);
      if (deduped.length >= MAX_SHOWN_RECALL_KEYS) break;
    }
    const next = {
      ...existing,
      shownRecallKeys: deduped,
      recallItems,
      updatedAt: now,
    };
    set({
      byCourseId: { ...get().byCourseId, [courseId]: next },
    });
    persistRecord(next);
  },

  resetCourse: (courseId) => {
    const next = { ...get().byCourseId };
    delete next[courseId];
    set({ byCourseId: next });
    enqueueWrite(() => deleteCourseRecord(courseId));
  },

  resetAll: () => {
    set({ byCourseId: {} });
    enqueueWrite(() => clearAllProgress());
  },

  importFromJson: async (raw) => {
    await writeQueue;
    await importProgressJson(raw);
    const byCourseId = await loadAllRecords();
    set({ byCourseId, hydrated: true });
  },

  exportToJson: async () => {
    await writeQueue;
    return exportProgressJson(true);
  },
}));

export type { CourseProgressRecord };

export function listCoursesInProgress(
  byCourseId: Record<string, CourseProgressRecord>,
): CourseProgressRecord[] {
  return Object.values(byCourseId)
    .filter((record) => record.startedLessonIds.length > 0 || record.completedLessonIds.length > 0)
    .toSorted((left, right) => right.updatedAt - left.updatedAt);
}
