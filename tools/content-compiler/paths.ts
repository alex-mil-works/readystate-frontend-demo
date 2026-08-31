import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveCoursesDirRelative } from '../../src/shared/config/content-source.js';

if (process.argv.includes('--demo')) {
  process.env.CONTENT_SOURCE ??= 'demo';
  process.env.VITE_DEMO ??= 'true';
}

const compilerDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(compilerDir, '../..');
const coursesDirRelative = resolveCoursesDirRelative({
  CONTENT_SOURCE: process.env.CONTENT_SOURCE,
  VITE_CONTENT_SOURCE: process.env.VITE_CONTENT_SOURCE,
  VITE_DEMO: process.env.VITE_DEMO,
  COURSES_DIR: process.env.COURSES_DIR,
});

/** Repo-relative and generated output paths for the content compiler. */
export const paths = {
  repoRoot,
  coursesDirRelative,
  coursesDir: path.join(repoRoot, coursesDirRelative),
  generatedDir: path.join(repoRoot, 'src/shared/content/generated'),
  /** Legacy flat course bundle: `generated/<courseId>/course.json`. */
  generatedCourseJson: (courseId: string) =>
    path.join(repoRoot, 'src/shared/content/generated', courseId, 'course.json'),
  /** Discipline stack bundle: `generated/<roleId>/<stackId>/course.json`. */
  generatedDisciplineCourseJson: (roleId: string, stackId: string) =>
    path.join(repoRoot, 'src/shared/content/generated', roleId, stackId, 'course.json'),
} as const;

/** Repo-relative POSIX path for stable logs and JSON. */
export function toRepoRelative(absolutePath: string): string {
  return path.relative(paths.repoRoot, absolutePath).split(path.sep).join('/');
}
