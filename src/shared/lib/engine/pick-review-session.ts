import type { PoolActivity, PoolScope } from '@/shared/lib/content';

import { pickRecall, poolActivityKeys } from './pick-recall';
import { REVIEW_SESSION_SIZE, type RecallScheduleState, isRecallDue } from './review-schedule';

export type PickReviewSessionOptions = {
  /** Max cards (default REVIEW_SESSION_SIZE). */
  n?: number;
  /** Candidate bank (unit + stage + course pools, caller-deduped). */
  pool: PoolActivity[];
  /** Schedule state by contentUid / activity key. */
  scheduleByKey?: Record<string, RecallScheduleState>;
  now?: number;
  /** Prefer cards that reinforce this lesson (optional). */
  lessonId?: string;
  phases?: Array<'revision' | 'phrasing' | 'practice'>;
  scope?: PoolScope;
  random?: () => number;
};

function activityKey(item: PoolActivity): string {
  return item.contentUid ?? `${item.scope}:${item.id}`;
}

/** How many pool cards are due right now (same filters as session pick). */
export function countDueReviewCards(options: Omit<PickReviewSessionOptions, 'n'>): number {
  return filterDuePool(options).length;
}

function filterDuePool(options: Omit<PickReviewSessionOptions, 'n'>): PoolActivity[] {
  const { pool, scheduleByKey = {}, now = Date.now(), phases = ['revision', 'phrasing'] } = options;
  const phaseSet = new Set(phases);

  return pool.filter((item) => {
    if (!phaseSet.has(item.phase)) return false;
    const key = activityKey(item);
    return isRecallDue(scheduleByKey[key] ?? scheduleByKey[item.id], now);
  });
}

/**
 * Build a capped review session from due (or never-scheduled) pool cards.
 * Reuses pickRecall ranking among the due subset.
 */
export function pickReviewSession(options: PickReviewSessionOptions): PoolActivity[] {
  const n = options.n ?? REVIEW_SESSION_SIZE;
  const duePool = filterDuePool(options);
  if (duePool.length === 0 || n <= 0) return [];

  return pickRecall({
    n,
    scope: options.scope ?? 'course',
    pool: duePool,
    lessonId: options.lessonId,
    phases: options.phases ?? ['revision', 'phrasing'],
    random: options.random,
  });
}

export { poolActivityKeys };
