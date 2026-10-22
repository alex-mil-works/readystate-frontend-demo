import {
  type CoursePreview,
  type LessonGroupPreview,
  type StagePreview,
  type UnitItemPreview,
  flattenStagesToUnits,
} from '@/shared/config/course-model';
import { courseCompositeId, parseCourseCompositeId } from '@/shared/lib/progress';

import type { CourseContentBundle, StageContentBundle, UnitContentBundle } from './types';
import type { PoolActivity } from './types';

const BUNDLES_BY_ID = new Map<string, CourseContentBundle>();

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

/** Replace all compiled course bundles (remote load / tests). */
export function replaceCompiledBundles(bundles: CourseContentBundle[]): void {
  BUNDLES_BY_ID.clear();
  for (const bundle of bundles) {
    BUNDLES_BY_ID.set(bundle.courseId, bundle);
    if (bundle.roleId && bundle.stackId) {
      BUNDLES_BY_ID.set(courseCompositeId(bundle.roleId, bundle.stackId), bundle);
    }
  }
}

export function getCompiledCourse(courseId: string): CoursePreview | undefined {
  const bundle = getBundle(courseId);
  if (!bundle) return undefined;
  return bundleToPreview(bundle);
}

export function getCompiledCourseByRoleStack(
  roleId: string,
  stackId: string,
): CoursePreview | undefined {
  return getCompiledCourse(courseCompositeId(roleId, stackId));
}

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

export function getCompiledLesson(courseId: string, lessonId: string) {
  const bundle = getBundle(courseId);
  if (!bundle) return undefined;
  return findLessonInBundle(bundle, lessonId);
}

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

export function getCourseReviewPool(courseId: string): PoolActivity[] {
  const bundle = getBundle(courseId);
  if (!bundle) return [];

  const seen = new Set<string>();
  const out: PoolActivity[] = [];

  const pushAll = (items: PoolActivity[]) => {
    for (const item of items) {
      const key = item.contentUid ?? `${item.scope}:${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  };

  pushAll(bundle.pools.course);
  for (const stage of bundle.stages) {
    pushAll(stage.pools.stage);
    for (const unit of stage.units) {
      pushAll(unit.pools.unit);
    }
  }

  return out;
}

export function getCourseReviewPoolByRoleStack(roleId: string, stackId: string): PoolActivity[] {
  return getCourseReviewPool(courseCompositeId(roleId, stackId));
}

export type { CourseContentBundle };
