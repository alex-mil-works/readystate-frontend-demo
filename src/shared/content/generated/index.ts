import {
  type CoursePreview,
  type LessonGroupPreview,
  type StagePreview,
  type UnitItemPreview,
  flattenStagesToUnits,
} from '@/shared/config/course-model';
import { courseCompositeId, parseCourseCompositeId } from '@/shared/lib/progress';

import type { CourseContentBundle, StageContentBundle, UnitContentBundle } from '../types';
import type { PoolActivity } from '../types';

/** Legacy flat bundles: `generated/<courseId>/course.json`. */
const legacyBundles = import.meta.glob<CourseContentBundle>('./*/course.json', {
  eager: true,
  import: 'default',
});

/** Discipline stack bundles: `generated/<roleId>/<stackId>/course.json`. */
const disciplineBundles = import.meta.glob<CourseContentBundle>('./*/*/course.json', {
  eager: true,
  import: 'default',
});

const BUNDLES_BY_ID = new Map<string, CourseContentBundle>();

for (const bundle of Object.values(legacyBundles)) {
  BUNDLES_BY_ID.set(bundle.courseId, bundle);
}

for (const bundle of Object.values(disciplineBundles)) {
  BUNDLES_BY_ID.set(bundle.courseId, bundle);
  if (bundle.roleId && bundle.stackId) {
    BUNDLES_BY_ID.set(courseCompositeId(bundle.roleId, bundle.stackId), bundle);
  }
}

function lessonToItemPreview(lesson: UnitContentBundle['lessons'][number]): UnitItemPreview {
  return {
    id: lesson.id,
    kind: 'lesson',
    title: lesson.title,
    titleEn: lesson.titleEn,
    progress: {
      completed: 0,
      total: lesson.insights.length + lesson.activities.length,
    },
    playable: true,
    contentUid: lesson.contentUid,
  };
}

function unitToGroupPreview(unit: UnitContentBundle, playable: boolean): LessonGroupPreview {
  return {
    groupId: unit.unitId,
    unitId: unit.unitId,
    items: unit.lessons.map((lesson) => ({
      ...lessonToItemPreview(lesson),
      playable,
    })),
  };
}

function stageToPreview(stage: StageContentBundle): StagePreview {
  const empty = stage.empty === true || stage.units.length === 0;
  return {
    id: stage.stageId,
    title: stage.title,
    titleEn: stage.titleEn,
    empty,
    groups: empty ? [] : stage.units.map((unit) => unitToGroupPreview(unit, true)),
  };
}

function bundleToPreview(bundle: CourseContentBundle): CoursePreview {
  const stages = bundle.stages.map(stageToPreview);

  return {
    id: bundle.courseId,
    title: bundle.title,
    titleEn: bundle.titleEn,
    description: bundle.description,
    roleId: bundle.roleId,
    stackId: bundle.stackId,
    status: bundle.status,
    statusLabel: bundle.statusLabel,
    stages,
    units: flattenStagesToUnits(stages),
  };
}

function resolveBundleId(courseId: string): string | undefined {
  if (BUNDLES_BY_ID.has(courseId)) return courseId;

  const parsed = parseCourseCompositeId(courseId);
  if (parsed) {
    const composite = courseCompositeId(parsed.roleId, parsed.stackId);
    if (BUNDLES_BY_ID.has(composite)) return composite;
  }

  return undefined;
}

function getBundle(courseId: string): CourseContentBundle | undefined {
  const resolved = resolveBundleId(courseId);
  if (!resolved) return undefined;
  return BUNDLES_BY_ID.get(resolved);
}

/** Compiled course map for the home workspace. Undefined when JSON is missing. */
export function getCompiledCourse(courseId: string): CoursePreview | undefined {
  const bundle = getBundle(courseId);
  if (!bundle) return undefined;
  return bundleToPreview(bundle);
}

/** Lookup by role + stack (discipline path preferred, legacy fallback). */
export function getCompiledCourseByRoleStack(
  roleId: string,
  stackId: string,
): CoursePreview | undefined {
  return getCompiledCourse(courseCompositeId(roleId, stackId));
}

/** All compiled courses (deduped by preview id). */
export function listCompiledCourses(): CoursePreview[] {
  const seen = new Set<string>();
  const courses: CoursePreview[] = [];

  for (const bundle of BUNDLES_BY_ID.values()) {
    const preview = bundleToPreview(bundle);
    if (seen.has(preview.id)) continue;
    seen.add(preview.id);
    courses.push(preview);
  }

  return courses;
}

/** Look up a compiled lesson for the lesson player (legacy course id). */
export function getCompiledLesson(courseId: string, lessonId: string) {
  const bundle = getBundle(courseId);
  if (!bundle) return undefined;
  return findLessonInBundle(bundle, lessonId);
}

/** Look up a compiled lesson by role + stack. */
export function getCompiledLessonByRoleStack(roleId: string, stackId: string, lessonId: string) {
  return getCompiledLesson(courseCompositeId(roleId, stackId), lessonId);
}

function findLessonInBundle(bundle: CourseContentBundle, lessonId: string) {
  for (const stage of bundle.stages) {
    for (const unit of stage.units) {
      const match = unit.lessons.find((lesson) => lesson.id === lessonId);
      if (match) return match;
    }
  }
  return undefined;
}

export type LessonPoolContext = {
  courseId: string;
  stageId: string;
  unitId: string;
  lessonId: string;
  unitPool: PoolActivity[];
  stagePool: PoolActivity[];
  coursePool: PoolActivity[];
};

/** Locate a lesson and return its unit/stage/course pools for the recall engine. */
export function getLessonPoolContext(
  courseId: string,
  lessonId: string,
): LessonPoolContext | undefined {
  const bundle = getBundle(courseId);
  if (!bundle) return undefined;

  for (const stage of bundle.stages) {
    for (const unit of stage.units) {
      const lesson = unit.lessons.find((entry) => entry.id === lessonId);
      if (!lesson) continue;
      return {
        courseId: bundle.courseId,
        stageId: stage.stageId,
        unitId: unit.unitId,
        lessonId,
        unitPool: unit.pools.unit,
        stagePool: stage.pools.stage,
        coursePool: bundle.pools.course,
      };
    }
  }

  return undefined;
}

export function getLessonPoolContextByRoleStack(
  roleId: string,
  stackId: string,
  lessonId: string,
): LessonPoolContext | undefined {
  return getLessonPoolContext(courseCompositeId(roleId, stackId), lessonId);
}

export type { CourseContentBundle };
