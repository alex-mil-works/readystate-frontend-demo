import { describe, expect, it } from 'vitest';

import type { PoolActivity } from '@/shared/lib/content';
import { pickRecall, poolActivityKeys } from '@/shared/lib/engine';

function revisionCard(id: string, extras: Partial<PoolActivity> = {}): PoolActivity {
  return {
    id,
    kind: 'single_choice',
    phase: 'revision',
    prompt: `Prompt ${id}`,
    options: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B' },
    ],
    explain: 'Because.',
    scope: 'unit',
    courseId: 'frontend/react',
    stageId: 'S01',
    unitId: 'U01',
    sourcePath: 'fixture',
    contentUid: `uid-${id}`,
    ...extras,
  } as PoolActivity;
}

describe('pickRecall', () => {
  const pool = [
    revisionCard('r1', { reinforces: ['L001-js-values-model'], tags: ['typeof'] }),
    revisionCard('r2', { tags: ['null'] }),
    revisionCard('r3', { reinforces: ['L002'], tags: ['nan'] }),
    {
      ...revisionCard('speak1'),
      phase: 'phrasing' as const,
      kind: 'interview_phrasing' as const,
      rubric: 'r',
      sampleAnswer: 's',
      prompt: 'Speak',
    },
  ];

  it('returns at most n revision cards from the unit pool', () => {
    const picked = pickRecall({
      n: 2,
      scope: 'unit',
      pool,
      random: () => 0.5,
    });
    expect(picked).toHaveLength(2);
    expect(picked.every((item) => item.phase === 'revision')).toBe(true);
  });

  it('boosts cards that reinforce the current lesson', () => {
    const picked = pickRecall({
      n: 1,
      scope: 'unit',
      pool,
      lessonId: 'L001-js-values-model',
      random: () => 0,
    });
    expect(picked[0]?.id).toBe('r1');
  });

  it('down-ranks recently shown keys', () => {
    const picked = pickRecall({
      n: 1,
      scope: 'unit',
      pool: [revisionCard('old'), revisionCard('fresh')],
      recentlyShown: ['uid-old'],
      random: () => 0,
    });
    expect(picked[0]?.id).toBe('fresh');
  });

  it('returns empty when pool has no matching phase', () => {
    expect(
      pickRecall({
        n: 2,
        scope: 'unit',
        pool: [pool[3]!],
        random: () => 0,
      }),
    ).toEqual([]);
  });

  it('poolActivityKeys prefers contentUid', () => {
    expect(poolActivityKeys([revisionCard('x')])).toEqual(['uid-x']);
  });
});
