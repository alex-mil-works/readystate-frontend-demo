import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { StackCourseManifestSchema } from '../../src/shared/lib/content/schemas/stack-course.js';
import type { StackCourseManifest } from '../../src/shared/lib/content/schemas/stack-course.js';
import { parseManifestYaml } from './parse-yaml.js';
import { toRepoRelative } from './paths.js';

export type LoadedStackCourse = StackCourseManifest & {
  stackDir: string;
  contentDir: string;
  coursePoolDir: string;
};

/** Load `stacks/<stack>/course.yaml`. */
export async function loadStackCourse(
  disciplineDir: string,
  stackId: string,
): Promise<LoadedStackCourse> {
  const stackDir = path.join(disciplineDir, 'stacks', stackId);
  const manifestPath = path.join(stackDir, 'course.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifestYaml(
    manifestSource,
    StackCourseManifestSchema,
    toRepoRelative(manifestPath),
  );

  if (manifest.stackId !== stackId) {
    throw new Error(
      `${toRepoRelative(manifestPath)}: stackId "${manifest.stackId}" !== folder "${stackId}"`,
    );
  }

  const contentDir = path.join(stackDir, 'content');

  return {
    ...manifest,
    stackDir: toRepoRelative(stackDir),
    contentDir: toRepoRelative(contentDir),
    coursePoolDir: path.join(contentDir, 'activities'),
  };
}
