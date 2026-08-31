import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { DISCIPLINE_ROLES } from '@/entities/discipline';

import { discoverDisciplines, loadDiscipline } from '../../tools/content-compiler/load-discipline';
import { paths } from '../../tools/content-compiler/paths';
import { manifestsToCatalogRoles } from '../../tools/content-compiler/write-discipline-catalog';

const hasCourses = existsSync(path.join(paths.coursesDir, 'frontend/discipline.yaml'));

describe.skipIf(!hasCourses)('discipline catalog sync', () => {
  it('matches DISCIPLINE_ROLES to .courses/*/discipline.yaml', async () => {
    const dirs = await discoverDisciplines(paths.coursesDir);
    const manifests = await Promise.all(dirs.map((dir) => loadDiscipline(dir)));
    expect(manifestsToCatalogRoles(manifests)).toEqual(DISCIPLINE_ROLES);
  });
});
