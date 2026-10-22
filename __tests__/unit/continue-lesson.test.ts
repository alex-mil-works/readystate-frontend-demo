import { describe, expect, it } from 'vitest';

import type { CoursePreview } from '@/shared/config';
import type { CourseProgressRecord } from '@/shared/lib/progress';

import { findContinueLessonTarget, lessonDomId } from '@/widgets/course-map/lib/continue-lesson';

const course: CoursePreview = {
  id: 'frontend/react',
  roleId: 'frontend',
  stackId: 'react',
  title: 'React Frontend',
  titleEn: 'React Frontend',
  description: 'test',
  status: 'preview',
  statusLabel: 'Preview',
  stages: [
    {
      id: 'S01',
      title: 'Stage 1',
      titleEn: 'Stage 1',
      groups: [
        {
          groupId: 'U01',
          unitId: 'U01',
          items: [
            {
              id: 'L001',
              title: 'Lesson 1',
              titleEn: 'Lesson 1',
              kind: 'lesson',
              playable: true,
              locked: false,
              progress: { completed: 0, total: 4 },
            },
            {
              id: 'L002',
              title: 'Lesson 2',
              titleEn: 'Lesson 2',
              kind: 'lesson',
              playable: true,
              locked: false,
              progress: { completed: 0, total: 4 },
            },
          ],
        },
      ],
    },
  ],
  units: [],
};

describe('findContinueLessonTarget', () => {
  it('returns null when nothing is in progress', () => {
    expect(findContinueLessonTarget(course, undefined)).toBeNull();
  });

  it('picks the latest in-progress lesson by startedAt', () => {
    const record: CourseProgressRecord = {
      courseId: 'frontend/react',
      roleId: 'frontend',
      stackId: 'react',
      title: 'React Frontend',
      startedLessonIds: ['L001', 'L002'],
      completedLessonIds: [],
      lessonTimes: {
        L001: { startedAt: 10 },
        L002: { startedAt: 20 },
      },
      shownRecallKeys: [],
      recallItems: {},
      updatedAt: 30,
    };

    expect(findContinueLessonTarget(course, record)).toEqual({
      lessonId: 'L002',
      stageId: 'S01',
    });
  });
});

describe('lessonDomId', () => {
  it('prefixes lesson id', () => {
    expect(lessonDomId('L001')).toBe('lesson-L001');
  });
});
