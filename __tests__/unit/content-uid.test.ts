import { describe, expect, it } from 'vitest';

import {
  courseCompositeId,
  lessonActivityContentUid,
  lessonContentUid,
  parseCourseCompositeId,
  poolActivityContentUid,
  unitContentUid,
} from '@/shared/lib/progress';

describe('contentUid helpers', () => {
  it('builds composite course id', () => {
    expect(courseCompositeId('frontend', 'react')).toBe('frontend/react');
    expect(parseCourseCompositeId('frontend/react')).toEqual({
      roleId: 'frontend',
      stackId: 'react',
    });
  });

  it('builds lesson and activity uids', () => {
    expect(
      lessonContentUid({
        roleId: 'frontend',
        stackId: 'react',
        stageId: 'S01',
        unitId: 'U01',
        lessonId: 'L001',
      }),
    ).toBe('frontend.stack.react.stage.S01.unit.U01.lesson.L001');

    expect(
      lessonActivityContentUid({
        roleId: 'frontend',
        stackId: 'react',
        stageId: 'S01',
        unitId: 'U01',
        lessonId: 'L001',
        activityId: 'p01',
      }),
    ).toBe('frontend.stack.react.stage.S01.unit.U01.lesson.L001.activity.p01');
  });

  it('builds unit and pool uids', () => {
    expect(
      unitContentUid({
        roleId: 'qa-automation',
        stackId: 'java',
        stageId: 'S01',
        unitId: 'U01',
      }),
    ).toBe('qa-automation.stack.java.stage.S01.unit.U01');

    expect(
      poolActivityContentUid({
        roleId: 'frontend',
        stackId: 'react',
        scope: 'stage',
        stageId: 'S01',
        activityId: 'r-s01-01',
      }),
    ).toBe('frontend.stack.react.pool.stage.S01.activity.r-s01-01');
  });
});
