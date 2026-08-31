import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  type StageContent,
  StageManifestSchema,
} from '../../src/shared/lib/content/schemas/stage.js';
import { loadPoolDir } from './load-pool.js';
import { loadUnit } from './load-unit.js';
import { parseManifestYaml } from './parse-yaml.js';
import { paths, toRepoRelative } from './paths.js';

/** Load stage.yaml and every unit it lists. */
export async function loadStage(stageDir: string): Promise<StageContent> {
  const manifestPath = path.join(stageDir, 'stage.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifestYaml(
    manifestSource,
    StageManifestSchema,
    toRepoRelative(manifestPath),
  );

  const units = await Promise.all(
    manifest.units.map((unitFolder) => loadUnit(path.join(stageDir, unitFolder))),
  );

  return {
    ...manifest,
    units,
    sourcePath: toRepoRelative(stageDir),
  };
}

/** Stage repeat-pool activities (empty folder → []). */
export async function loadStagePool(stage: StageContent, courseId: string) {
  if (!stage.activities) return [];
  const poolDir = path.join(paths.repoRoot, stage.sourcePath, stage.activities);
  return loadPoolDir(poolDir, {
    scope: 'stage',
    courseId,
    stageId: stage.id,
  });
}
