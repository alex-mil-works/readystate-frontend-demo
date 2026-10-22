import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type CourseContentBundle, replaceCompiledBundles } from '@/shared/content/registry';

import { type DisciplineRole, replaceDisciplineRoles } from '@/entities/discipline';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/courses');

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(fixturesDir, name), 'utf8')) as T;
}

/** Seed registry from committed demo fixtures so unit/component tests need no API. */
const roles = loadJson<DisciplineRole[]>('disciplines.json');
const frontendReact = loadJson<CourseContentBundle>('frontend-react.json');
const qaJava = loadJson<CourseContentBundle>('qa-java.json');

replaceDisciplineRoles(roles);
replaceCompiledBundles([frontendReact, qaJava]);
