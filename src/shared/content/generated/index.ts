/**
 * Content accessors for the player.
 * Bundles are loaded at runtime from the private content API.
 */
export {
  getCompiledCourse,
  getCompiledCourseByRoleStack,
  getCompiledLesson,
  getCompiledLessonByRoleStack,
  getCourseReviewPool,
  getCourseReviewPoolByRoleStack,
  getLessonPoolContext,
  getLessonPoolContextByRoleStack,
  listCompiledCourses,
  replaceCompiledBundles,
  type CourseContentBundle,
  type LessonPoolContext,
} from '../registry';
