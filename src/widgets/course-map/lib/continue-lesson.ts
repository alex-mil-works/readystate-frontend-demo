import { type CoursePreview, type UnitItemPreview, resolveProgressStatus } from '@/shared/config';
import type { CourseProgressRecord } from '@/shared/lib/progress';
import { overlayCourseProgress } from '@/shared/lib/progress';

import { resolveDisplayStages } from '../ui/display-stages';

export type ContinueLessonTarget = {
  lessonId: string;
  stageId: string;
};

/** Last in-progress lesson on the map (by startedAt, then document order). */
export function findContinueLessonTarget(
  course: CoursePreview,
  progressRecord: CourseProgressRecord | undefined,
): ContinueLessonTarget | null {
  const mapped = overlayCourseProgress(course, progressRecord);
  const stages = resolveDisplayStages(mapped);

  let best: { lessonId: string; stageId: string; startedAt: number; order: number } | null = null;
  let order = 0;

  for (const stage of stages) {
    if (stage.empty) continue;
    for (const group of stage.groups) {
      for (const item of group.items) {
        order += 1;
        if (item.locked || item.playable !== true) continue;
        const status = resolveProgressStatus(item.progress);
        if (status !== 'in_progress') continue;
        const startedAt = progressRecord?.lessonTimes[item.id]?.startedAt ?? 0;
        if (
          !best ||
          startedAt > best.startedAt ||
          (startedAt === best.startedAt && order > best.order)
        ) {
          best = { lessonId: item.id, stageId: stage.id, startedAt, order };
        }
      }
    }
  }

  return best ? { lessonId: best.lessonId, stageId: best.stageId } : null;
}

export function lessonDomId(lessonId: string): string {
  return `lesson-${lessonId}`;
}

export type { UnitItemPreview };
