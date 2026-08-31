/**
 * Course map types for the home workspace.
 * Canonical tree: course → stage → unit (group) → lesson → steps.
 * Stages are labeled in UI; units are silent visual groups.
 */

export type CourseStatus = 'preview' | 'coming-soon';

export type UnitItemKind = 'lesson';

/** How far the learner got in a lesson. Not the same as a step's pill/role. */
export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type LessonProgress = {
  completed: number;
  total: number;
};

export type UnitItemPreview = {
  id: string;
  kind: UnitItemKind;
  title: string;
  titleEn: string;
  /** Placeholder until Dexie: completed steps / total steps. */
  progress: LessonProgress;
  /** Locked until the previous unit is done. */
  locked?: boolean;
  /** When true, the tile opens the lesson player. */
  playable?: boolean;
  /** Stable Dexie key; from compiled JSON when present. */
  contentUid?: string;
};

/** Silent visual group of lessons (unit without a map label). */
export type LessonGroupPreview = {
  groupId: string;
  unitId: string;
  items: UnitItemPreview[];
};

export type StagePreview = {
  id: string;
  title: string;
  titleEn: string;
  /** Skeleton stage with no stack content yet. */
  empty?: boolean;
  groups: LessonGroupPreview[];
};

/** @deprecated Flat unit list — use `stages` on CoursePreview. Kept for legacy bundles. */
export type UnitPreview = {
  id: string;
  title: string;
  titleEn: string;
  items: UnitItemPreview[];
};

export type CoursePreview = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  /** Role / discipline, e.g. `frontend`, `qa-automation`. */
  roleId?: string;
  roleLabel?: string;
  /** Stack inside the role, e.g. `react`, `java`. */
  stackId?: string;
  stackLabel?: string;
  status: CourseStatus;
  statusLabel: string;
  /** Stage-first map (preferred). */
  stages: StagePreview[];
  /** @deprecated Derived flat list for transitional code paths. */
  units: UnitPreview[];
};

export function resolveProgressStatus(progress: LessonProgress): LessonProgressStatus {
  if (progress.completed <= 0) return 'not_started';
  if (progress.completed >= progress.total) return 'completed';
  return 'in_progress';
}

/** Flatten stage groups into legacy unit previews (unit titles preserved for debugging). */
export function flattenStagesToUnits(stages: StagePreview[]): UnitPreview[] {
  const units: UnitPreview[] = [];
  for (const stage of stages) {
    for (const group of stage.groups) {
      units.push({
        id: group.unitId,
        title: group.unitId,
        titleEn: group.unitId,
        items: group.items,
      });
    }
  }
  return units;
}
