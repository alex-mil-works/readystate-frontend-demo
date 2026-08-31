import type { PoolScope } from '@/shared/lib/content';

/** Composite course id for URLs and bundle lookup: `frontend/react`. */
export function courseCompositeId(roleId: string, stackId: string): string {
  return `${roleId}/${stackId}`;
}

export function parseCourseCompositeId(
  compositeId: string,
): { roleId: string; stackId: string } | undefined {
  const slash = compositeId.indexOf('/');
  if (slash <= 0 || slash === compositeId.length - 1) return undefined;
  return {
    roleId: compositeId.slice(0, slash),
    stackId: compositeId.slice(slash + 1),
  };
}

export function lessonContentUid(params: {
  roleId: string;
  stackId: string;
  stageId: string;
  unitId: string;
  lessonId: string;
}): string {
  const { roleId, stackId, stageId, unitId, lessonId } = params;
  return `${roleId}.stack.${stackId}.stage.${stageId}.unit.${unitId}.lesson.${lessonId}`;
}

export function lessonActivityContentUid(params: {
  roleId: string;
  stackId: string;
  stageId: string;
  unitId: string;
  lessonId: string;
  activityId: string;
}): string {
  const { roleId, stackId, stageId, unitId, lessonId, activityId } = params;
  return `${roleId}.stack.${stackId}.stage.${stageId}.unit.${unitId}.lesson.${lessonId}.activity.${activityId}`;
}

export function unitContentUid(params: {
  roleId: string;
  stackId: string;
  stageId: string;
  unitId: string;
}): string {
  const { roleId, stackId, stageId, unitId } = params;
  return `${roleId}.stack.${stackId}.stage.${stageId}.unit.${unitId}`;
}

export function poolActivityContentUid(params: {
  roleId: string;
  stackId: string;
  scope: PoolScope;
  activityId: string;
  stageId?: string;
  unitId?: string;
}): string {
  const { roleId, stackId, scope, activityId, stageId, unitId } = params;
  const scopePart =
    scope === 'course'
      ? 'course'
      : scope === 'stage'
        ? `stage.${stageId ?? 'unknown'}`
        : `stage.${stageId ?? 'unknown'}.unit.${unitId ?? 'unknown'}`;
  return `${roleId}.stack.${stackId}.pool.${scopePart}.activity.${activityId}`;
}
