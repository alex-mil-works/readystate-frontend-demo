import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { CourseContentBundle, StageContentBundle } from '../../src/shared/content/types.js';
import type { StageContent } from '../../src/shared/lib/content/schemas/stage.js';
import { courseCompositeId } from '../../src/shared/lib/progress/content-uid.js';
import { injectContentUids } from './inject-content-uids.js';
import { loadDiscipline } from './load-discipline.js';
import { loadPoolDir } from './load-pool.js';
import { assertSkeletonRoleMatch, loadSkeleton, skeletonStageIds } from './load-skeleton.js';
import { loadStackCourse } from './load-stack-course.js';
import { loadStage, loadStagePool } from './load-stage.js';
import { unitToLessonContentArray } from './load-unit.js';
import { paths, toRepoRelative } from './paths.js';

export type CompileStackResult = {
  courseId: string;
  roleId: string;
  stackId: string;
  outPath: string;
  stageCount: number;
  unitCount: number;
  lessonCount: number;
  activityCount: number;
  poolCount: number;
  emptyStageCount: number;
};

function assertUnitStageMatch(unitStageId: string, stageId: string, unitPath: string): void {
  if (unitStageId !== stageId) {
    throw new Error(
      `${unitPath}: unit stageId "${unitStageId}" does not match parent stage "${stageId}"`,
    );
  }
}

function trackLessonIds(
  lessonIds: Map<string, string>,
  stageId: string,
  unitId: string,
  lessonId: string,
): void {
  const key = lessonId;
  const location = `${stageId}/${unitId}/${lessonId}`;
  const existing = lessonIds.get(key);
  if (existing) {
    throw new Error(`Duplicate lesson id "${lessonId}" at ${location} (already at ${existing})`);
  }
  lessonIds.set(key, location);
}

/** Load one stage folder from stack content and validate against skeleton. */
async function loadStackStage(
  stageDir: string,
  allowedStageIds: Set<string>,
  courseId: string,
): Promise<StageContent> {
  const stage = await loadStage(stageDir);
  if (!allowedStageIds.has(stage.id)) {
    throw new Error(`${stage.sourcePath}: stage id "${stage.id}" is not declared in skeleton.yaml`);
  }
  for (const unit of stage.units) {
    assertUnitStageMatch(unit.stageId, stage.id, unit.sourcePath);
  }
  // Touch courseId for pool loaders (validates paths resolve)
  void courseId;
  return stage;
}

/** Merge skeleton stage order with stack-authored stage folders. */
export async function compileStack(
  disciplineDir: string,
  stackId: string,
): Promise<CompileStackResult> {
  const discipline = await loadDiscipline(disciplineDir);
  const skeleton = await loadSkeleton(disciplineDir);
  assertSkeletonRoleMatch(discipline.roleId, skeleton, discipline.disciplineDir);

  const stackEntry = discipline.stacks.find((stack) => stack.id === stackId);
  if (!stackEntry) {
    throw new Error(
      `${discipline.disciplineDir}: stack "${stackId}" is not listed in discipline.yaml`,
    );
  }

  const stackCourse = await loadStackCourse(disciplineDir, stackId);
  const allowedStageIds = skeletonStageIds(skeleton);
  const roleId = discipline.roleId;
  const courseId = courseCompositeId(roleId, stackId);

  const stageById = new Map<string, StageContent>();
  for (const stageFolder of stackCourse.stages) {
    const stageDir = path.join(disciplineDir, 'stacks', stackId, 'content', stageFolder);
    const stage = await loadStackStage(stageDir, allowedStageIds, courseId);
    if (stageById.has(stage.id)) {
      throw new Error(
        `Duplicate skeleton stage "${stage.id}" from folders in stacks/${stackId}/course.yaml`,
      );
    }
    stageById.set(stage.id, stage);
  }

  let lessonCount = 0;
  let activityCount = 0;
  let poolCount = 0;
  let unitCount = 0;
  let emptyStageCount = 0;
  const lessonIds = new Map<string, string>();

  const stages: StageContentBundle[] = await Promise.all(
    skeleton.stages.map(async (skeletonStage) => {
      const loaded = stageById.get(skeletonStage.id);

      if (!loaded) {
        emptyStageCount += 1;
        return {
          stageId: skeletonStage.id,
          title: skeletonStage.title,
          titleEn: skeletonStage.titleEn,
          empty: true,
          units: [],
          pools: { stage: [] },
        };
      }

      const stagePool = await loadStagePool(loaded, courseId);
      poolCount += stagePool.length;

      const units = await Promise.all(
        loaded.units.map(async (unit) => {
          unitCount += 1;
          const lessons = unitToLessonContentArray(unit);
          for (const lesson of lessons) {
            trackLessonIds(lessonIds, skeletonStage.id, unit.id, lesson.id);
            lessonCount += 1;
            activityCount += lesson.activities.length;
          }

          const unitPool = await loadPoolDir(
            path.join(paths.repoRoot, unit.sourcePath, 'activities'),
            {
              scope: 'unit',
              courseId,
              stageId: skeletonStage.id,
              unitId: unit.id,
            },
          );
          poolCount += unitPool.length;

          return {
            unitId: unit.id,
            stageId: unit.stageId,
            title: unit.title,
            titleEn: unit.titleEn,
            lessons,
            pools: { unit: unitPool },
          };
        }),
      );

      return {
        stageId: skeletonStage.id,
        title: skeletonStage.title,
        titleEn: skeletonStage.titleEn,
        empty: units.length === 0,
        units,
        pools: { stage: stagePool },
      };
    }),
  );

  const coursePool = await loadPoolDir(stackCourse.coursePoolDir, {
    scope: 'course',
    courseId,
  });
  poolCount += coursePool.length;

  let bundle: CourseContentBundle = {
    courseId,
    roleId,
    stackId,
    title: stackCourse.title,
    titleEn: stackCourse.titleEn,
    description: stackCourse.description,
    status: stackCourse.status,
    statusLabel: stackCourse.statusLabel,
    stages,
    pools: { course: coursePool },
  };

  bundle = injectContentUids(bundle, { roleId, stackId });

  const outPath = paths.generatedDisciplineCourseJson(roleId, stackId);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');

  return {
    courseId,
    roleId,
    stackId,
    outPath,
    stageCount: stages.length,
    unitCount,
    lessonCount,
    activityCount,
    poolCount,
    emptyStageCount,
  };
}

export function formatCompileStackResult(result: CompileStackResult): string {
  const relative = toRepoRelative(result.outPath);
  const emptyNote =
    result.emptyStageCount > 0 ? `, ${result.emptyStageCount} empty skeleton stages` : '';
  return `${result.courseId}: ${result.stageCount} stages, ${result.unitCount} units, ${result.lessonCount} lessons, ${result.activityCount} in-lesson activities, ${result.poolCount} pool items${emptyNote} → ${relative}`;
}
