/** Parsed content types and schemas. Runtime FS loading lives in tools/content-compiler. */

export type {
  Activity,
  ActivityHint,
  ActivityPhase,
  ChoiceOption,
  CourseManifest,
  CourseStatus,
  Insight,
  InterviewPhrasingActivity,
  LessonContent,
  LessonDepth,
  LessonManifest,
  PoolActivity,
  PoolScope,
  PredictOutputActivity,
  SingleChoiceActivity,
  UnitContent,
  UnitManifest,
} from './schemas';

export {
  ActivityHintSchema,
  ActivityPhaseSchema,
  ActivitySchema,
  CourseManifestSchema,
  CourseStatusSchema,
  InsightFrontmatterSchema,
  LessonDepthSchema,
  LessonManifestSchema,
  PoolScopeSchema,
  UnitManifestSchema,
} from './schemas';

export { parseInsightMarkdown, splitMarkdownFrontmatter } from './parse-markdown';
export { parseOrThrow } from './parse-or-throw';
