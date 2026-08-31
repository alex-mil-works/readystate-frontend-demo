import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { DisciplineManifestSchema } from '../../src/shared/lib/content/schemas/discipline.js';
import type { DisciplineManifest } from '../../src/shared/lib/content/schemas/discipline.js';
import { parseManifestYaml } from './parse-yaml.js';
import { toRepoRelative } from './paths.js';

export type LoadedDiscipline = DisciplineManifest & {
  disciplineDir: string;
};

/** Load `.courses/<role>/discipline.yaml`. */
export async function loadDiscipline(disciplineDir: string): Promise<LoadedDiscipline> {
  const manifestPath = path.join(disciplineDir, 'discipline.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifestYaml(
    manifestSource,
    DisciplineManifestSchema,
    toRepoRelative(manifestPath),
  );

  return {
    ...manifest,
    disciplineDir: toRepoRelative(disciplineDir),
  };
}

/** Discover role folders that contain `discipline.yaml`. */
export async function discoverDisciplines(coursesDir: string): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');
  let entries: string[];
  try {
    entries = await readdir(coursesDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const disciplineDirs: string[] = [];
  for (const entry of entries) {
    const disciplineDir = path.join(coursesDir, entry);
    try {
      await readFile(path.join(disciplineDir, 'discipline.yaml'), 'utf8');
      disciplineDirs.push(disciplineDir);
    } catch {
      // not a discipline folder
    }
  }

  return disciplineDirs.toSorted();
}

/** List stack ids that have `stacks/<id>/course.yaml`. */
export async function discoverStackIds(disciplineDir: string): Promise<string[]> {
  const stacksRoot = path.join(disciplineDir, 'stacks');
  const { readdir } = await import('node:fs/promises');
  let entries: string[];
  try {
    entries = await readdir(stacksRoot);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const stackIds: string[] = [];
  for (const entry of entries) {
    const stackDir = path.join(stacksRoot, entry);
    try {
      await readFile(path.join(stackDir, 'course.yaml'), 'utf8');
      stackIds.push(entry);
    } catch {
      // not a stack course folder
    }
  }

  return stackIds.toSorted();
}
