export {
  courseCompositeId,
  lessonActivityContentUid,
  lessonContentUid,
  parseCourseCompositeId,
  poolActivityContentUid,
  unitContentUid,
} from './content-uid';

export { overlayCourseProgress } from './overlay';

export {
  PROGRESS_DOCUMENT_VERSION,
  PROGRESS_FORMAT,
  type ProgressCourse,
  type ProgressDocument,
  type ProgressItem,
  type ProgressLesson,
  parseProgressDocument,
  parseProgressDocumentJson,
} from './document';

export { documentToRecords, recordsToDocument, recordToCourse, courseToRecord } from './convert';

export type { CourseProgressRecord, LessonTimeEntry } from './progress-types';

export {
  WARMTH_COLOR,
  WARMTH_HOT_MS,
  WARMTH_LABEL,
  WARMTH_LEGEND,
  WARMTH_WARM_MS,
  lessonActivityAt,
  resolveLessonWarmth,
  resolveStageWarmth,
  warmthFromAge,
  type LessonWarmth,
} from './warmth';

export {
  clearAllProgress,
  exportProgressDocument,
  exportProgressJson,
  hydrateProgressWithLegacyMigration,
  importProgressDocument,
  importProgressJson,
  loadAllRecords,
  saveCourseRecord,
} from './repository';

export { getProgressDb, resetProgressDbForTests } from './db';
