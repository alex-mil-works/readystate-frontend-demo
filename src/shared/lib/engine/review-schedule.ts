/** Review session scheduling (A1 simple intervals). */

export const REVIEW_SESSION_SIZE = 10;

/** Day length for due intervals (ms). */
export const REVIEW_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * After the Nth show (1-based showCount after increment), delay until next due.
 * 1 → 1d, 2 → 3d, ≥3 → 7d.
 */
export function reviewIntervalMs(showCountAfterShow: number): number {
  if (showCountAfterShow <= 1) return 1 * REVIEW_DAY_MS;
  if (showCountAfterShow === 2) return 3 * REVIEW_DAY_MS;
  return 7 * REVIEW_DAY_MS;
}

export function nextDueAt(showCountAfterShow: number, now = Date.now()): number {
  return now + reviewIntervalMs(showCountAfterShow);
}

export type RecallScheduleState = {
  lastShownAt?: number;
  showCount?: number;
  /** null / missing = never scheduled → eligible. */
  dueAt?: number | null;
};

/** Eligible for review: never scheduled, or dueAt <= now. */
export function isRecallDue(state: RecallScheduleState | undefined, now = Date.now()): boolean {
  if (!state) return true;
  if (state.dueAt === null || state.dueAt === undefined) return true;
  return state.dueAt <= now;
}
