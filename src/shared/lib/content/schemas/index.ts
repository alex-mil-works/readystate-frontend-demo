/** Valibot schemas for course → stage → unit → lesson → steps (insights + activities). */

export {
  ActivityHintSchema,
  ActivityPhaseSchema,
  ActivitySchema,
  InterviewPhrasingActivitySchema,
  PoolScopeSchema,
  PredictOutputActivitySchema,
  SingleChoiceActivitySchema,
  type Activity,
  type ActivityHint,
  type ActivityPhase,
  type ChoiceOption,
  type InterviewPhrasingActivity,
  type PoolActivity,
  type PoolScope,
  type PredictOutputActivity,
  type SingleChoiceActivity,
} from './activity';

export {
  CourseManifestSchema,
  CourseStatusSchema,
  type CourseManifest,
  type CourseStatus,
} from './course';

export { StageManifestSchema, type StageContent, type StageManifest } from './stage';

export { InsightFrontmatterSchema, type Insight, type InsightFrontmatter } from './insight';

export {
  LessonDepthSchema,
  LessonManifestSchema,
  type LessonContent,
  type LessonDepth,
  type LessonManifest,
} from './lesson';

export { UnitManifestSchema, type UnitContent, type UnitManifest } from './unit';

export {
  DisciplineManifestSchema,
  DisciplineStackEntrySchema,
  type DisciplineManifest,
  type DisciplineStackEntry,
} from './discipline';

export {
  SkeletonManifestSchema,
  SkeletonStageSchema,
  type SkeletonManifest,
  type SkeletonStage,
} from './skeleton';

export { StackCourseManifestSchema, type StackCourseManifest } from './stack-course';
