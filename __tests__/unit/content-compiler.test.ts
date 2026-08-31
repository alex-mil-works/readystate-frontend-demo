import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { compileStack } from '../../tools/content-compiler/compile-stack';
import { discoverDisciplines } from '../../tools/content-compiler/load-discipline';
import { loadLesson } from '../../tools/content-compiler/load-lesson';
import { loadPoolDir } from '../../tools/content-compiler/load-pool';
import { loadStage, loadStagePool } from '../../tools/content-compiler/load-stage';
import { loadUnit, unitToLessonContentArray } from '../../tools/content-compiler/load-unit';
import { paths } from '../../tools/content-compiler/paths';

const frontendDir = path.join(paths.coursesDir, 'frontend');
const reactStackDir = path.join(frontendDir, 'stacks/react');
const u01Unit = path.join(reactStackDir, 'content/s01-js-core/u01-values-types');
const u02Unit = path.join(reactStackDir, 'content/s01-js-core/u02-objects-arrays-mutation');
const s01Stage = path.join(reactStackDir, 'content/s01-js-core');

const qaDir = path.join(paths.coursesDir, 'qa-automation');
const javaStackDir = path.join(qaDir, 'stacks/java');
const qaCoreUnit = path.join(javaStackDir, 'content/s01-lang-foundations/u-lang-core');
const qaStage = path.join(javaStackDir, 'content/s01-lang-foundations');

const hasFrontendCurriculum = existsSync(path.join(frontendDir, 'discipline.yaml'));
const hasQaCurriculum = existsSync(path.join(qaDir, 'discipline.yaml'));

describe.skipIf(!hasFrontendCurriculum)('content-compiler L001-js-values-model', () => {
  it('loads manifest + insights + activities into LessonContent', async () => {
    const lessonDir = path.join(u01Unit, 'lessons/l001');
    const lesson = await loadLesson(lessonDir, { unitId: 'U01', stageId: 'S01' });

    expect(lesson.id).toBe('L001-js-values-model');
    expect(lesson.insights).toHaveLength(2);
    expect(lesson.activities).toHaveLength(5);
    expect(lesson.insights[0]?.kind).toBe('insight');
    expect(lesson.activities[0]?.kind).toBe('single_choice');
    expect(lesson.insights.map((insight) => insight.id)).toEqual(['i01', 'i02']);
    expect(lesson.activities.map((activity) => activity.id)).toEqual([
      'p01',
      'p02',
      'p03',
      'r01',
      'i01',
    ]);
  });
});

describe.skipIf(!hasFrontendCurriculum)('content-compiler frontend react', () => {
  it('loads U01 lessons in unit order', async () => {
    const unit = await loadUnit(u01Unit);
    const lessons = unitToLessonContentArray(unit);

    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'L001-js-values-model',
      'L002-js-typeof-primitives',
      'L003-js-equality-coercion',
      'L004-js-truthiness-nullish',
    ]);
    expect(lessons.reduce((sum, l) => sum + l.activities.length, 0)).toBe(21);
  });

  it('loads U02 lessons in unit order', async () => {
    const unit = await loadUnit(u02Unit);
    const lessons = unitToLessonContentArray(unit);

    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'L005-js-objects-ownership',
      'L006-js-arrays-iteration',
      'L007-js-mutation-copies',
    ]);
    expect(lessons.reduce((sum, l) => sum + l.activities.length, 0)).toBe(17);
  });

  it('indexes unit/stage/course pools', async () => {
    const u01Pool = await loadPoolDir(path.join(u01Unit, 'activities'), {
      scope: 'unit',
      courseId: 'frontend/react',
      stageId: 'S01',
      unitId: 'U01',
    });
    const u02Pool = await loadPoolDir(path.join(u02Unit, 'activities'), {
      scope: 'unit',
      courseId: 'frontend/react',
      stageId: 'S01',
      unitId: 'U02',
    });
    const stage = await loadStage(s01Stage);
    const stagePool = await loadStagePool(stage, 'frontend/react');
    const coursePool = await loadPoolDir(path.join(reactStackDir, 'content/activities'), {
      scope: 'course',
      courseId: 'frontend/react',
    });

    expect(u01Pool).toHaveLength(4);
    expect(u02Pool).toHaveLength(4);
    expect(stagePool).toHaveLength(4);
    expect(coursePool).toEqual([]);
  });

  it('writes discipline stack course.json via compileStack', async () => {
    const result = await compileStack(frontendDir, 'react');

    expect(result.courseId).toBe('frontend/react');
    expect(result.stageCount).toBe(8);
    expect(result.emptyStageCount).toBe(7);
    expect(result.unitCount).toBe(5);
    expect(result.lessonCount).toBe(16);
    expect(result.activityCount).toBe(88);
    expect(result.poolCount).toBe(24);
    expect(result.outPath).toMatch(
      /src\/shared\/content\/generated\/frontend\/react\/course\.json$/,
    );
  });

  it('discovers frontend and qa-automation disciplines', async () => {
    const disciplines = await discoverDisciplines(paths.coursesDir);
    const disciplineIds = disciplines.map((dir) => path.basename(dir)).toSorted();
    expect(disciplineIds).toContain('frontend');
    expect(disciplineIds).toContain('qa-automation');
  });

  it('keeps between two and nine lessons per unit', async () => {
    const stage = await loadStage(s01Stage);
    for (const unit of stage.units) {
      expect(unit.lessons.length).toBeGreaterThanOrEqual(2);
      expect(unit.lessons.length).toBeLessThanOrEqual(6);
    }
  });
});

describe.skipIf(!hasQaCurriculum)('content-compiler qa-automation java', () => {
  it('loads L001-java-syntax-primitives', async () => {
    const lessonDir = path.join(qaCoreUnit, 'lessons/l001');
    const lesson = await loadLesson(lessonDir, { unitId: 'U-lang-core', stageId: 'S01' });

    expect(lesson.id).toBe('L001-java-syntax-primitives');
    expect(lesson.insights).toHaveLength(2);
    expect(lesson.activities).toHaveLength(7);
  });

  it('loads seven S01 units with ≥2 lessons each (L001–L017)', async () => {
    const stage = await loadStage(qaStage);
    expect(stage.units).toHaveLength(7);

    for (const unit of stage.units) {
      expect(unit.lessons.length).toBeGreaterThanOrEqual(2);
      expect(unit.lessons.length).toBeLessThanOrEqual(6);
    }

    const allLessons = stage.units.flatMap((unit) => unitToLessonContentArray(unit));
    expect(allLessons.map((lesson) => lesson.id)).toEqual([
      'L001-java-syntax-primitives',
      'L002-java-control-flow',
      'L003-java-arrays',
      'L004-java-methods',
      'L005-java-oop-classes',
      'L006-java-oop-encap',
      'L007-java-oop-inherit',
      'L008-java-oop-poly',
      'L009-java-oop-iface',
      'L010-java-errors-checked',
      'L011-java-errors-twr',
      'L012-java-list-set',
      'L013-java-map',
      'L014-java-generics',
      'L015-java-streams',
      'L016-java-nio',
      'L017-java-jackson',
    ]);
    expect(allLessons.reduce((sum, l) => sum + l.activities.length, 0)).toBe(125);
  });

  it('writes qa-automation/java course.json via compileStack', async () => {
    const result = await compileStack(qaDir, 'java');

    expect(result.courseId).toBe('qa-automation/java');
    expect(result.stageCount).toBe(9);
    expect(result.emptyStageCount).toBe(8);
    expect(result.unitCount).toBe(7);
    expect(result.lessonCount).toBe(17);
    expect(result.activityCount).toBe(125);
    expect(result.poolCount).toBe(19);
    expect(result.outPath).toMatch(
      /src\/shared\/content\/generated\/qa-automation\/java\/course\.json$/,
    );
  });
});
