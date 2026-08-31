import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import type { PoolActivity, PoolScope } from '../../src/shared/lib/content/schemas/activity.js';
import { parseActivityYaml } from './parse-yaml.js';
import { toRepoRelative } from './paths.js';

export type PoolLoadContext = {
  scope: PoolScope;
  courseId: string;
  stageId?: string;
  unitId?: string;
};

/** Load `*.yaml` from a pool folder. Missing/empty dirs → []. */
export async function loadPoolDir(
  poolDir: string,
  context: PoolLoadContext,
): Promise<PoolActivity[]> {
  let entries: string[];
  try {
    entries = await readdir(poolDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  const yamlFiles = entries
    .filter((name) => name.endsWith('.yaml') || name.endsWith('.yml'))
    .toSorted();

  return Promise.all(
    yamlFiles.map(async (fileName) => {
      const filePath = path.join(poolDir, fileName);
      const source = await readFile(filePath, 'utf8');
      const activity = parseActivityYaml(source, toRepoRelative(filePath));
      return {
        ...activity,
        scope: context.scope,
        courseId: context.courseId,
        stageId: context.stageId,
        unitId: context.unitId,
        sourcePath: toRepoRelative(filePath),
      };
    }),
  );
}
