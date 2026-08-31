import { type CoursePreview, getCourseById, getCourseByRoleStack } from '@/shared/config';
import { getCompiledCourseByRoleStack } from '@/shared/content/generated';

import {
  DEFAULT_ROLE_ID,
  DEFAULT_STACK_ID,
  type DisciplineStack,
  firstAvailableStack,
  getRoleById,
  resolveRoleStack,
} from '@/entities/discipline';

/** Canonical course workspace: `/courses/:roleId/:stackId`. */
export function coursePathForRoleStack(
  roleId = DEFAULT_ROLE_ID,
  stackId = DEFAULT_STACK_ID,
): string {
  return `/courses/${encodeURIComponent(roleId)}/${encodeURIComponent(stackId)}`;
}

export function homePathForRoleStack(roleId = DEFAULT_ROLE_ID, stackId = DEFAULT_STACK_ID): string {
  return coursePathForRoleStack(roleId, stackId);
}

export function homePathForCourse(course: Pick<CoursePreview, 'roleId' | 'stackId'>): string {
  return coursePathForRoleStack(
    course.roleId ?? DEFAULT_ROLE_ID,
    course.stackId ?? DEFAULT_STACK_ID,
  );
}

export function homePathForCourseId(courseId: string): string {
  const course = getCourseById(courseId);
  if (!course) return coursePathForRoleStack();
  return homePathForCourse(course);
}

export function courseForSearch(roleId: string, stackId: string): CoursePreview | undefined {
  return getCourseByRoleStack(roleId, stackId);
}

export type CourseWorkspaceState =
  { kind: 'ready'; course: CoursePreview } | { kind: 'coming_soon' } | { kind: 'missing_bundle' };

/** Available stack without compiled JSON is a load error; unavailable stack stays «Скоро». */
export function resolveCourseWorkspace(
  roleId: string,
  stackId: string,
  stack: DisciplineStack,
): CourseWorkspaceState {
  const compiled = getCompiledCourseByRoleStack(roleId, stackId);
  if (compiled) return { kind: 'ready', course: compiled };
  if (stack.available === false) return { kind: 'coming_soon' };
  return { kind: 'missing_bundle' };
}

/** Resolve role/stack from route params; fall back to Frontend + React. */
export function resolveRoleStackParams(roleId?: string, stackId?: string) {
  return resolveRoleStack(roleId ?? DEFAULT_ROLE_ID, stackId ?? DEFAULT_STACK_ID);
}

/** Lesson player path: `/courses/:roleId/:stackId/lessons/:lessonId`. */
export function lessonPathForRoleStack(roleId: string, stackId: string, lessonId: string): string {
  return `${coursePathForRoleStack(roleId, stackId)}/lessons/${encodeURIComponent(lessonId)}`;
}

/** Resolve lesson path from a course preview. */
export function lessonPathForCourse(
  course: Pick<CoursePreview, 'id' | 'roleId' | 'stackId'>,
  lessonId: string,
): string {
  return lessonPathForRoleStack(
    course.roleId ?? DEFAULT_ROLE_ID,
    course.stackId ?? DEFAULT_STACK_ID,
    lessonId,
  );
}

/** First unlocked lesson id in map order (stages → groups → items). */
export function firstLessonIdFromCourse(course: CoursePreview): string | undefined {
  const stages =
    course.stages.length > 0
      ? course.stages
      : course.units.length > 0
        ? [
            {
              id: 'flat',
              empty: false as boolean | undefined,
              groups: course.units.map((unit) => ({
                groupId: unit.id,
                unitId: unit.id,
                items: unit.items,
              })),
            },
          ]
        : [];

  for (const stage of stages) {
    if (stage.empty) continue;
    for (const group of stage.groups) {
      for (const item of group.items) {
        if (!item.locked) return item.id;
      }
    }
  }
  return undefined;
}

/** Path to the first lesson, or the course map if none. */
export function firstLessonPathForCourse(course: CoursePreview): string {
  const lessonId = firstLessonIdFromCourse(course);
  if (!lessonId) return homePathForCourse(course);
  return lessonPathForCourse(course, lessonId);
}

export function stackAfterRoleChange(roleId: string) {
  const role = getRoleById(roleId);
  if (!role) return resolveRoleStack(roleId, DEFAULT_STACK_ID).stack;
  return firstAvailableStack(role);
}

/** Short lesson ids → semantic ids (bookmarks from before slug suffixes). */
const LEGACY_LESSON_ID_BY_ROLE_STACK: Record<string, Record<string, string>> = {
  'frontend/react': {
    L001: 'L001-js-values-model',
    L002: 'L002-js-typeof-primitives',
    L003: 'L003-js-equality-coercion',
    L004: 'L004-js-truthiness-nullish',
    L005: 'L005-js-objects-ownership',
    L006: 'L006-js-arrays-iteration',
    L007: 'L007-js-mutation-copies',
    L008: 'L008-js-lexical-scope-tdz',
    L009: 'L009-js-closures',
    L010: 'L010-js-var-let-const-loops',
    L011: 'L011-js-function-forms',
    L012: 'L012-js-this-binding',
    L013: 'L013-js-arrow-call-bind',
    L014: 'L014-js-destructuring-spread',
    L015: 'L015-js-map-set-symbol',
    L016: 'L016-js-classes-modules',
  },
  'qa-automation/java': {
    L001: 'L001-java-syntax-primitives',
    L002: 'L002-java-control-flow',
    L003: 'L003-java-arrays',
    L004: 'L004-java-methods',
  },
};

function resolveLegacyLessonId(roleId: string, stackId: string, lessonId: string): string {
  const map = LEGACY_LESSON_ID_BY_ROLE_STACK[`${roleId}/${stackId}`];
  return map?.[lessonId] ?? lessonId;
}

/** Short lesson id on a canonical role/stack URL → semantic lesson path. */
export function legacyLessonIdRedirect(
  roleId: string,
  stackId: string,
  lessonId: string,
): string | undefined {
  const resolved = resolveLegacyLessonId(roleId, stackId, lessonId);
  if (resolved === lessonId) return undefined;
  return lessonPathForRoleStack(roleId, stackId, resolved);
}
