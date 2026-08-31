import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { CourseContentBundle } from '../../src/shared/content/types.js';
import { loadCourse, loadCoursePool } from './load-course.js';
import { loadPoolDir } from './load-pool.js';
import { loadStagePool } from './load-stage.js';
import { unitToLessonContentArray } from './load-unit.js';
import { paths, toRepoRelative } from './paths.js';

export type CompileCourseResult = {
  courseId: string;
  outPath: string;
  stageCount: number;
  unitCount: number;
  lessonCount: number;
  activityCount: number;
  poolCount: number;
};

/** Write one legacy flat course bundle JSON for map + player.
 * Dormant while `.courses/` only has discipline layouts (role/discipline.yaml);
 * kept so accidental flat folders still compile.
 */
export async function compileCourse(courseDir: string): Promise<CompileCourseResult> {
  const course = await loadCourse(courseDir);
  const coursePool = await loadCoursePool(course);

  let lessonCount = 0;
  let activityCount = 0;
  let poolCount = coursePool.length;

  const stages = await Promise.all(
    course.stages.map(async (stage) => {
      const stagePool = await loadStagePool(stage, course.id);
      poolCount += stagePool.length;

      const units = await Promise.all(
        stage.units.map(async (unit) => {
          const lessons = unitToLessonContentArray(unit);
          lessonCount += lessons.length;
          activityCount += lessons.reduce((sum, lesson) => sum + lesson.activities.length, 0);

          const unitPool = await loadPoolDir(
            path.join(paths.repoRoot, unit.sourcePath, 'activities'),
            {
              scope: 'unit',
              courseId: course.id,
              stageId: stage.id,
              unitId: unit.id,
            },
          );
          poolCount += unitPool.length;

          return {
            unitId: unit.id,
            stageId: stage.id,
            title: unit.title,
            titleEn: unit.titleEn,
            lessons,
            pools: { unit: unitPool },
          };
        }),
      );

      return {
        stageId: stage.id,
        title: stage.title,
        titleEn: stage.titleEn,
        units,
        pools: { stage: stagePool },
      };
    }),
  );

  const bundle: CourseContentBundle = {
    courseId: course.id,
    title: course.title,
    titleEn: course.titleEn,
    description: course.description,
    status: course.status,
    statusLabel: course.statusLabel,
    stages,
    pools: { course: coursePool },
  };

  const outPath = paths.generatedCourseJson(course.id);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

  return {
    courseId: course.id,
    outPath,
    stageCount: stages.length,
    unitCount: stages.reduce((sum, stage) => sum + stage.units.length, 0),
    lessonCount,
    activityCount,
    poolCount,
  };
}

export function formatCompileResult(result: CompileCourseResult): string {
  const relative = toRepoRelative(result.outPath);
  return `${result.courseId}: ${result.stageCount} stages, ${result.unitCount} units, ${result.lessonCount} lessons, ${result.activityCount} in-lesson activities, ${result.poolCount} pool items → ${relative}`;
}
