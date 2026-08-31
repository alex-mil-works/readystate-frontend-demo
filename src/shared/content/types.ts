import type {
  Activity,
  CourseStatus,
  LessonContent,
  PoolActivity,
  PoolScope,
  UnitContent,
} from '@/shared/lib/content';

/** Compiled unit slice inside a course bundle. */
export type UnitContentBundle = {
  unitId: string;
  stageId: string;
  title: string;
  titleEn: string;
  /** Stable Dexie key; compiler-generated. */
  contentUid?: string;
  lessons: LessonContent[];
  pools: {
    unit: PoolActivity[];
  };
};

/** Compiled stage slice inside a course bundle. */
export type StageContentBundle = {
  stageId: string;
  title: string;
  titleEn: string;
  /** True when skeleton stage has no stack content yet. */
  empty?: boolean;
  units: UnitContentBundle[];
  pools: {
    stage: PoolActivity[];
  };
};

/** Full compiled course tree for map + player. */
export type CourseContentBundle = {
  /** Composite id: `roleId/stackId` for discipline stacks; legacy flat id otherwise. */
  courseId: string;
  roleId?: string;
  stackId?: string;
  title: string;
  titleEn: string;
  description: string;
  status: CourseStatus;
  statusLabel: string;
  stages: StageContentBundle[];
  pools: {
    course: PoolActivity[];
  };
};

export type { Activity, CourseStatus, LessonContent, PoolActivity, PoolScope, UnitContent };
