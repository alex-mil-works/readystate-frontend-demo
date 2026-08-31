import { rm } from 'node:fs/promises';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import { compileStack } from '../../tools/content-compiler/compile-stack';
import { discoverStackIds } from '../../tools/content-compiler/load-discipline';
import { loadDiscipline } from '../../tools/content-compiler/load-discipline';
import {
  assertSkeletonRoleMatch,
  loadSkeleton,
  skeletonStageIds,
} from '../../tools/content-compiler/load-skeleton';

const fixtureDisciplineDir = path.join(import.meta.dirname, '../fixtures/discipline/frontend');

afterAll(async () => {
  await rm(path.join(import.meta.dirname, '../../src/shared/content/generated/fixture-role'), {
    recursive: true,
    force: true,
  });
});

describe('discipline compiler (Phase 0 fixture)', () => {
  it('loads discipline and skeleton manifests', async () => {
    const discipline = await loadDiscipline(fixtureDisciplineDir);
    const skeleton = await loadSkeleton(fixtureDisciplineDir);

    expect(discipline.roleId).toBe('fixture-role');
    expect(discipline.stacks.map((stack) => stack.id)).toContain('react');
    assertSkeletonRoleMatch(discipline.roleId, skeleton, discipline.disciplineDir);
    expect(skeletonStageIds(skeleton)).toEqual(new Set(['S01', 'S02']));
  });

  it('discovers stack folders with course.yaml', async () => {
    const stackIds = await discoverStackIds(fixtureDisciplineDir);
    expect(stackIds).toEqual(['react']);
  });

  it('compiles stack with skeleton empty stage and contentUid injection', async () => {
    const result = await compileStack(fixtureDisciplineDir, 'react');

    expect(result.courseId).toBe('fixture-role/react');
    expect(result.roleId).toBe('fixture-role');
    expect(result.stackId).toBe('react');
    expect(result.stageCount).toBe(2);
    expect(result.emptyStageCount).toBe(1);
    expect(result.unitCount).toBe(1);
    expect(result.lessonCount).toBe(2);
    expect(result.outPath).toMatch(/generated\/fixture-role\/react\/course\.json$/);

    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(result.outPath, 'utf8');
    const bundle = JSON.parse(raw) as {
      roleId: string;
      stackId: string;
      stages: Array<{
        stageId: string;
        empty?: boolean;
        units: Array<{
          lessons: Array<{
            id: string;
            contentUid?: string;
            activities: Array<{ contentUid?: string }>;
          }>;
        }>;
      }>;
    };

    expect(bundle.roleId).toBe('fixture-role');
    expect(bundle.stackId).toBe('react');

    const s01 = bundle.stages.find((stage) => stage.stageId === 'S01');
    const s02 = bundle.stages.find((stage) => stage.stageId === 'S02');

    expect(s01?.empty).not.toBe(true);
    expect(s01?.units[0]?.lessons[0]?.contentUid).toBe(
      'fixture-role.stack.react.stage.S01.unit.U01.lesson.L001',
    );
    expect(s01?.units[0]?.lessons[0]?.activities[0]?.contentUid).toBe(
      'fixture-role.stack.react.stage.S01.unit.U01.lesson.L001.activity.p01',
    );

    expect(s02?.empty).toBe(true);
    expect(s02?.units).toEqual([]);
  });
});
