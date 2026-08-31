import {
  type CoursePreview,
  type LessonProgress,
  type UnitItemPreview,
  flattenStagesToUnits,
} from '@/shared/config/course-model';
import type { CourseProgressRecord } from '@/shared/lib/progress/progress-types';

function overlayItemProgress(
  item: UnitItemPreview,
  record: CourseProgressRecord | undefined,
): LessonProgress {
  const total = item.progress.total;
  if (!record) return { completed: 0, total };
  if (record.completedLessonIds.includes(item.id)) return { completed: total, total };
  if (record.startedLessonIds.includes(item.id)) {
    return { completed: Math.min(1, total), total };
  }
  return { completed: 0, total };
}

/** Merge localStorage lesson progress onto a compiled course preview. */
export function overlayCourseProgress(
  course: CoursePreview,
  record: CourseProgressRecord | undefined,
): CoursePreview {
  const stages = course.stages.map((stage) => ({
    ...stage,
    groups: stage.groups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        progress: overlayItemProgress(item, record),
      })),
    })),
  }));

  return {
    ...course,
    stages,
    units: flattenStagesToUnits(stages),
  };
}
