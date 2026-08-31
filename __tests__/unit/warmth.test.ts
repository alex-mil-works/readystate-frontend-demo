import { describe, expect, it } from 'vitest';

import type { CourseProgressRecord } from '@/shared/lib/progress/progress-types';
import {
  WARMTH_HOT_MS,
  WARMTH_WARM_MS,
  lessonActivityAt,
  resolveLessonWarmth,
  resolveStageWarmth,
  warmthFromAge,
} from '@/shared/lib/progress/warmth';

const DAY = 24 * 60 * 60 * 1000;

describe('warmthFromAge', () => {
  it('bands age into hot / warm / cold', () => {
    expect(warmthFromAge(0)).toBe('hot');
    expect(warmthFromAge(WARMTH_HOT_MS - 1)).toBe('hot');
    expect(warmthFromAge(WARMTH_HOT_MS)).toBe('warm');
    expect(warmthFromAge(WARMTH_WARM_MS - 1)).toBe('warm');
    expect(warmthFromAge(WARMTH_WARM_MS)).toBe('cold');
  });
});

describe('resolveLessonWarmth', () => {
  const now = 1_700_000_000_000;

  it('returns null for not started', () => {
    expect(resolveLessonWarmth('not_started', now - DAY, now)).toBeNull();
    expect(resolveLessonWarmth('completed', undefined, now)).toBeNull();
  });

  it('uses activity age for started and completed', () => {
    expect(resolveLessonWarmth('in_progress', now - DAY, now)).toBe('hot');
    expect(resolveLessonWarmth('completed', now - 5 * DAY, now)).toBe('warm');
    expect(resolveLessonWarmth('completed', now - 20 * DAY, now)).toBe('cold');
  });
});

describe('lessonActivityAt', () => {
  it('prefers completedAt, then startedAt, then updatedAt', () => {
    const record: CourseProgressRecord = {
      courseId: 'frontend/react',
      roleId: 'frontend',
      stackId: 'react',
      title: 'React Frontend',
      startedLessonIds: ['L001', 'L002'],
      completedLessonIds: ['L001'],
      lessonTimes: {
        L001: { startedAt: 10, completedAt: 20 },
        L002: { startedAt: 30 },
      },
      shownRecallKeys: [],
      updatedAt: 99,
    };

    expect(lessonActivityAt(record, 'L001', 'completed')).toBe(20);
    expect(lessonActivityAt(record, 'L002', 'in_progress')).toBe(30);
    expect(lessonActivityAt(record, 'L003', 'not_started')).toBeUndefined();
    expect(lessonActivityAt({ ...record, lessonTimes: {} }, 'L001', 'completed')).toBe(99);
  });
});

describe('resolveStageWarmth', () => {
  it('picks the coolest non-null band', () => {
    expect(resolveStageWarmth([null, null])).toBeNull();
    expect(resolveStageWarmth([null, 'hot'])).toBe('hot');
    expect(resolveStageWarmth(['hot', 'warm', null])).toBe('warm');
    expect(resolveStageWarmth(['hot', 'cold', 'warm'])).toBe('cold');
  });
});
