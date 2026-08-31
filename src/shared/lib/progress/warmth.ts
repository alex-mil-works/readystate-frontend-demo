import type { LessonProgressStatus } from '@/shared/config/course-model';

import type { CourseProgressRecord, LessonTimeEntry } from './progress-types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Age under this → hot. */
export const WARMTH_HOT_MS = 3 * DAY_MS;
/** Age under this (and ≥ hot) → warm; older → cold. */
export const WARMTH_WARM_MS = 14 * DAY_MS;

export type LessonWarmth = 'hot' | 'warm' | 'cold';

export const WARMTH_LABEL: Record<LessonWarmth, string> = {
  hot: 'Свежо',
  warm: 'Держится',
  cold: 'Остыло',
};

/** CSS color tokens for map dots + legend: field / coyote / brick. */
export const WARMTH_COLOR: Record<LessonWarmth, string> = {
  hot: 'var(--rs-success)',
  warm: 'var(--rs-accent)',
  cold: 'var(--rs-destructive)',
};

/** Phrase legend (map strip). Title in UI: «Повторение». */
export const WARMTH_LEGEND: Array<{ id: LessonWarmth; phrase: string }> = [
  { id: 'hot', phrase: 'недавно касались' },
  { id: 'warm', phrase: 'ещё в голове' },
  { id: 'cold', phrase: 'пора повторить' },
];

/** Higher = cooler (worse for interview readiness). */
const WARMTH_COOL_RANK: Record<LessonWarmth, number> = {
  hot: 1,
  warm: 2,
  cold: 3,
};

/** Map age since last activity to a warmth band. */
export function warmthFromAge(ageMs: number): LessonWarmth {
  if (ageMs < WARMTH_HOT_MS) return 'hot';
  if (ageMs < WARMTH_WARM_MS) return 'warm';
  return 'cold';
}

/** Last activity timestamp for warmth (complete preferred over start). */
export function lessonActivityAt(
  record: CourseProgressRecord | undefined,
  lessonId: string,
  status: LessonProgressStatus,
): number | undefined {
  if (!record || status === 'not_started') return undefined;
  const times: LessonTimeEntry | undefined = record.lessonTimes?.[lessonId];
  if (status === 'completed') {
    return times?.completedAt ?? times?.startedAt ?? record.updatedAt;
  }
  return times?.startedAt ?? record.updatedAt;
}

/** `null` = not started (no heat yet). */
export function resolveLessonWarmth(
  status: LessonProgressStatus,
  activityAt: number | undefined,
  now = Date.now(),
): LessonWarmth | null {
  if (status === 'not_started' || activityAt === undefined) return null;
  return warmthFromAge(Math.max(0, now - activityAt));
}

/**
 * Stage rollup: coolest non-null among lessons (cold > warm > hot).
 * Empty / all not-started → null.
 */
export function resolveStageWarmth(lessons: Array<LessonWarmth | null>): LessonWarmth | null {
  let coolest: LessonWarmth | null = null;
  for (const item of lessons) {
    if (!item) continue;
    if (!coolest || WARMTH_COOL_RANK[item] > WARMTH_COOL_RANK[coolest]) coolest = item;
  }
  return coolest;
}
