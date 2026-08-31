import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { CourseManifestSchema } from '../../src/shared/lib/content/schemas/course.js';
import type { StageContent } from '../../src/shared/lib/content/schemas/stage.js';
import { loadPoolDir } from './load-pool.js';
import { loadStage, loadStagePool } from './load-stage.js';
import { parseManifestYaml } from './parse-yaml.js';
import { paths, toRepoRelative } from './paths.js';

export type LoadedCourse = {
  manifestPath: string;
  courseDir: string;
  contentDir: string;
  id: string;
  title: string;
  titleEn: string;
  description: string;
  status: 'preview' | 'coming-soon';
  statusLabel: string;
  stages: StageContent[];
  coursePoolDir: string;
};

/** Load one course folder: course.yaml → stages → units → lessons. */
export async function loadCourse(courseDir: string): Promise<LoadedCourse> {
  const manifestPath = path.join(courseDir, 'course.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifestYaml(
    manifestSource,
    CourseManifestSchema,
    toRepoRelative(manifestPath),
  );

  const contentDir = path.join(courseDir, 'content');
  const stages = await Promise.all(
    manifest.stages.map((stagePath) => loadStage(path.join(contentDir, stagePath))),
  );

  return {
    manifestPath: toRepoRelative(manifestPath),
    courseDir: toRepoRelative(courseDir),
    contentDir: toRepoRelative(contentDir),
    id: manifest.id,
    title: manifest.title,
    titleEn: manifest.titleEn,
    description: manifest.description,
    status: manifest.status,
    statusLabel: manifest.statusLabel,
    stages,
    coursePoolDir: path.join(contentDir, 'activities'),
  };
}

/** Discover each `.courses/<id>/course.yaml`. */
export async function discoverCourses(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(paths.coursesDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const courseDirs: string[] = [];
  for (const entry of entries) {
    const courseDir = path.join(paths.coursesDir, entry);
    try {
      await readFile(path.join(courseDir, 'course.yaml'), 'utf8');
      courseDirs.push(courseDir);
    } catch {
      // not a course folder
    }
  }

  return courseDirs.toSorted();
}

/** Course-level repeat pool. */
export async function loadCoursePool(course: LoadedCourse) {
  return loadPoolDir(course.coursePoolDir, {
    scope: 'course',
    courseId: course.id,
  });
}

/** Load stage pools for all stages in a course. */
export async function loadAllStagePools(course: LoadedCourse) {
  return Promise.all(course.stages.map((stage) => loadStagePool(stage, course.id)));
}
