import { describe, expect, it } from 'vitest';

import type { PoolActivity } from '@/shared/lib/content';
import {
  REVIEW_DAY_MS,
  REVIEW_SESSION_SIZE,
  countDueReviewCards,
  isRecallDue,
  nextDueAt,
  pickReviewSession,
  reviewIntervalMs,
} from '@/shared/lib/engine';

function card(id: string, extras: Partial<PoolActivity> = {}): PoolActivity {
  return {
    id,
    kind: 'single_choice',
    phase: 'revision',
    prompt: `P ${id}`,
    options: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B' },
    ],
    explain: 'x',
    scope: 'unit',
    courseId: 'frontend/react',
    stageId: 'S01',
    unitId: 'U01',
    sourcePath: 'fixture',
    contentUid: `uid-${id}`,
    ...extras,
  } as PoolActivity;
}

describe('reviewIntervalMs / nextDueAt', () => {
  it('uses 1d / 3d / 7d by showCount', () => {
    expect(reviewIntervalMs(1)).toBe(1 * REVIEW_DAY_MS);
    expect(reviewIntervalMs(2)).toBe(3 * REVIEW_DAY_MS);
    expect(reviewIntervalMs(3)).toBe(7 * REVIEW_DAY_MS);
    expect(reviewIntervalMs(9)).toBe(7 * REVIEW_DAY_MS);
  });

  it('nextDueAt offsets from now', () => {
    const now = 1_700_000_000_000;
    expect(nextDueAt(1, now)).toBe(now + REVIEW_DAY_MS);
  });
});

describe('isRecallDue', () => {
  const now = 1_000;

  it('treats missing / null dueAt as eligible', () => {
    expect(isRecallDue(undefined, now)).toBe(true);
    expect(isRecallDue({ lastShownAt: 1, showCount: 1, dueAt: null }, now)).toBe(true);
  });

  it('compares dueAt to now', () => {
    expect(isRecallDue({ lastShownAt: 1, showCount: 1, dueAt: now }, now)).toBe(true);
    expect(isRecallDue({ lastShownAt: 1, showCount: 1, dueAt: now + 1 }, now)).toBe(false);
  });
});

describe('pickReviewSession', () => {
  const pool = [
    card('a'),
    card('b'),
    card('c'),
    card('d'),
    card('e'),
    card('f'),
    card('g'),
    card('h'),
    card('i'),
    card('j'),
    card('k'),
  ];

  it('returns at most REVIEW_SESSION_SIZE due cards', () => {
    const picked = pickReviewSession({
      pool,
      random: () => 0,
    });
    expect(picked.length).toBeLessThanOrEqual(REVIEW_SESSION_SIZE);
    expect(picked).toHaveLength(REVIEW_SESSION_SIZE);
  });

  it('returns empty when nothing is due', () => {
    const future = Date.now() + REVIEW_DAY_MS;
    const scheduleByKey = Object.fromEntries(
      pool.map((item) => [item.contentUid!, { lastShownAt: 1, showCount: 1, dueAt: future }]),
    );
    expect(pickReviewSession({ pool, scheduleByKey, random: () => 0 })).toEqual([]);
    expect(countDueReviewCards({ pool, scheduleByKey })).toBe(0);
  });

  it('only picks due subset', () => {
    const now = 5_000;
    const scheduleByKey = {
      'uid-a': { lastShownAt: 1, showCount: 1, dueAt: now - 1 },
      'uid-b': { lastShownAt: 1, showCount: 1, dueAt: now + 10_000 },
    };
    const picked = pickReviewSession({
      n: 10,
      pool: [card('a'), card('b'), card('c')],
      scheduleByKey,
      now,
      random: () => 0,
    });
    const ids = picked.map((item) => item.id);
    expect(ids).toContain('a');
    expect(ids).toContain('c');
    expect(ids).not.toContain('b');
  });
});
