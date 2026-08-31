import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { type UnitContent, UnitManifestSchema } from '../../src/shared/lib/content/schemas/unit.js';
import { loadLesson } from './load-lesson.js';
import { parseManifestYaml } from './parse-yaml.js';
import { toRepoRelative } from './paths.js';

/** Load unit.yaml and every lesson it lists. */
export async function loadUnit(unitDir: string): Promise<UnitContent> {
  const manifestPath = path.join(unitDir, 'unit.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifestYaml(
    manifestSource,
    UnitManifestSchema,
    toRepoRelative(manifestPath),
  );

  const lessons = await Promise.all(
    manifest.lessons.map(async (relativeLessonDir) => {
      const lessonDir = path.join(unitDir, relativeLessonDir);
      return loadLesson(lessonDir, { unitId: manifest.id, stageId: manifest.stageId });
    }),
  );

  return {
    id: manifest.id,
    stageId: manifest.stageId,
    title: manifest.title,
    titleEn: manifest.titleEn,
    activities: manifest.activities,
    lessons,
    sourcePath: toRepoRelative(unitDir),
  };
}

/** Lessons sorted by `order` for JSON output. Repeat pools come later. */
export function unitToLessonContentArray(unit: UnitContent) {
  return [...unit.lessons].toSorted((a, b) => a.order - b.order);
}
