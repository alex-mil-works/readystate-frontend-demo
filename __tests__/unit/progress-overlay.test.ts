import { describe, expect, it } from 'vitest';

import type { CoursePreview } from '@/shared/config';
import { overlayCourseProgress } from '@/shared/lib/progress';

const course: CoursePreview = {
  id: 'frontend/react',
  title: 'React Frontend',
  titleEn: 'React Frontend',
  description: 'test',
  roleId: 'frontend',
  stackId: 'react',
  status: 'preview',
  statusLabel: 'Preview',
  stages: [
    {
      id: 'S01',
      title: 'S01',
      titleEn: 'S01',
      groups: [
        {
          groupId: 'U01',
          unitId: 'U01',
          items: [
            {
              id: 'L001',
              kind: 'lesson',
              title: 'One',
              titleEn: 'One',
              progress: { completed: 0, total: 4 },
              playable: true,
            },
          ],
        },
      ],
    },
  ],
  units: [],
};

describe('overlayCourseProgress', () => {
  it('marks started lessons as in progress and completed as done', () => {
    const overlay = overlayCourseProgress(course, {
      courseId: 'frontend/react',
      roleId: 'frontend',
      stackId: 'react',
      title: 'React Frontend',
      startedLessonIds: ['L001'],
      completedLessonIds: ['L001'],
      lessonTimes: { L001: { startedAt: 1, completedAt: 2 } },
      shownRecallKeys: [],
      updatedAt: 1,
    });

    expect(overlay.stages[0]?.groups[0]?.items[0]?.progress).toEqual({
      completed: 4,
      total: 4,
    });
  });
});
