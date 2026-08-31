import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  type SkeletonManifest,
  SkeletonManifestSchema,
} from '../../src/shared/lib/content/schemas/skeleton.js';
import { parseManifestYaml } from './parse-yaml.js';
import { toRepoRelative } from './paths.js';

/** Load `.courses/<role>/skeleton.yaml`. */
export async function loadSkeleton(disciplineDir: string): Promise<SkeletonManifest> {
  const manifestPath = path.join(disciplineDir, 'skeleton.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  return parseManifestYaml(manifestSource, SkeletonManifestSchema, toRepoRelative(manifestPath));
}

/** Ensure skeleton.roleId matches discipline.roleId. */
export function assertSkeletonRoleMatch(
  disciplineRoleId: string,
  skeleton: SkeletonManifest,
  disciplinePath: string,
): void {
  if (skeleton.roleId !== disciplineRoleId) {
    throw new Error(
      `${disciplinePath}: skeleton.roleId "${skeleton.roleId}" !== discipline.roleId "${disciplineRoleId}"`,
    );
  }
}

export function skeletonStageIds(skeleton: SkeletonManifest): Set<string> {
  return new Set(skeleton.stages.map((stage) => stage.id));
}
