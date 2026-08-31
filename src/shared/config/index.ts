/** App-wide constants. */
export const APP_NAME = 'ReadyState';

/** Russian tagline (current UI language). */
export const APP_TAGLINE = 'Знания, готовые к интервью';

/** English tagline. */
export const APP_TAGLINE_EN = 'Your knowledge, interview-ready.';

export { APP_SHELL_WIDTH_CLASS } from './layout';

export {
  CONTENT_SOURCE,
  IS_DEMO_BUILD,
  type ContentSource,
  coursesDirForSource,
  resolveContentSource,
  resolveCoursesDirRelative,
} from './content-source';

export {
  resolveProgressStatus,
  flattenStagesToUnits,
  type CoursePreview,
  type CourseStatus,
  type LessonGroupPreview,
  type LessonProgress,
  type LessonProgressStatus,
  type StagePreview,
  type UnitItemKind,
  type UnitItemPreview,
  type UnitPreview,
} from './course-model';

export { getCourseById, getCourseByRoleStack } from './courses';
