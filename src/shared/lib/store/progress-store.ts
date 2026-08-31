import { create } from 'zustand';

import { MAX_SHOWN_RECALL_KEYS } from '@/shared/lib/progress/convert';
import type { CourseProgressRecord } from '@/shared/lib/progress/progress-types';
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
  markRecallShown: (courseId: string, keys: string[]) => void;
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
    updatedAt: Date.now(),
  };
}

let writeQueue: Promise<void> = Promise.resolve();

function persistRecord(record: CourseProgressRecord): void {
  writeQueue = writeQueue
    .then(() => saveCourseRecord(record))
    .catch((error: unknown) => {
      console.error('Failed to persist progress to Dexie', error);
    });
}

function enqueueWrite(work: () => Promise<void>): void {
  writeQueue = writeQueue.then(work).catch((error: unknown) => {
    console.error('Failed to update Dexie progress', error);
  });
}

/** Await pending Dexie writes (tests / export safety). */
export function flushProgressWrites(): Promise<void> {
  return writeQueue;
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

  markRecallShown: (courseId, keys) => {
    const existing = get().byCourseId[courseId];
    if (!existing || keys.length === 0) return;
    const merged = [...keys, ...existing.shownRecallKeys];
    const deduped: string[] = [];
    for (const key of merged) {
      if (!deduped.includes(key)) deduped.push(key);
      if (deduped.length >= MAX_SHOWN_RECALL_KEYS) break;
    }
    const next = {
      ...existing,
      shownRecallKeys: deduped,
      updatedAt: Date.now(),
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
