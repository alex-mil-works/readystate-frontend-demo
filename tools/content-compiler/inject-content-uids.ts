import type { CourseContentBundle, StageContentBundle } from '../../src/shared/content/types.js';
import type { PoolActivity } from '../../src/shared/lib/content/schemas/activity.js';
import type { LessonContent } from '../../src/shared/lib/content/schemas/lesson.js';
import {
  lessonActivityContentUid,
  lessonContentUid,
  poolActivityContentUid,
  unitContentUid,
} from '../../src/shared/lib/progress/content-uid.js';

export type ContentUidContext = {
  roleId: string;
  stackId: string;
};

function withLessonActivityUids(lesson: LessonContent, ctx: ContentUidContext): LessonContent {
  const contentUid = lessonContentUid({
    roleId: ctx.roleId,
    stackId: ctx.stackId,
    stageId: lesson.stageId ?? 'unknown',
    unitId: lesson.unitId ?? 'unknown',
    lessonId: lesson.id,
  });

  const activities = lesson.activities.map((activity) => ({
    ...activity,
    contentUid: lessonActivityContentUid({
      roleId: ctx.roleId,
      stackId: ctx.stackId,
      stageId: lesson.stageId ?? 'unknown',
      unitId: lesson.unitId ?? 'unknown',
      lessonId: lesson.id,
      activityId: activity.id,
    }),
  }));

  return { ...lesson, contentUid, activities };
}

function withPoolActivityUids(
  items: PoolActivity[],
  ctx: ContentUidContext,
  courseId: string,
): PoolActivity[] {
  return items.map((item) => ({
    ...item,
    courseId,
    contentUid: poolActivityContentUid({
      roleId: ctx.roleId,
      stackId: ctx.stackId,
      scope: item.scope,
      activityId: item.id,
      stageId: item.stageId,
      unitId: item.unitId,
    }),
  }));
}

/** Attach stable contentUid fields to a compiled bundle (discipline or legacy with role/stack). */
export function injectContentUids(
  bundle: CourseContentBundle,
  ctx: ContentUidContext,
): CourseContentBundle {
  const courseId = bundle.courseId;

  const stages: StageContentBundle[] = bundle.stages.map((stage) => ({
    ...stage,
    pools: {
      stage: withPoolActivityUids(stage.pools.stage, ctx, courseId),
    },
    units: stage.units.map((unit) => ({
      ...unit,
      contentUid: unitContentUid({
        roleId: ctx.roleId,
        stackId: ctx.stackId,
        stageId: unit.stageId,
        unitId: unit.unitId,
      }),
      lessons: unit.lessons.map((lesson) =>
        withLessonActivityUids({ ...lesson, stageId: unit.stageId, unitId: unit.unitId }, ctx),
      ),
      pools: {
        unit: withPoolActivityUids(unit.pools.unit, ctx, courseId),
      },
    })),
  }));

  return {
    ...bundle,
    roleId: ctx.roleId,
    stackId: ctx.stackId,
    stages,
    pools: {
      course: withPoolActivityUids(bundle.pools.course, ctx, courseId),
    },
  };
}
