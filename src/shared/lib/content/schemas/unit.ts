import * as v from 'valibot';

import type { LessonContent } from './lesson';

export const UnitManifestSchema = v.object({
  id: v.string(),
  stageId: v.string(),
  title: v.string(),
  titleEn: v.string(),
  /** Lesson dirs relative to the unit (min 2, max 6 — map group rhythm + UI grid). */
  lessons: v.pipe(v.array(v.string()), v.minLength(2), v.maxLength(6)),
  /** Relative path to this unit's repeat-pool folder (may be empty). */
  activities: v.optional(v.string()),
});

export type UnitManifest = v.InferOutput<typeof UnitManifestSchema>;

export type UnitContent = Omit<UnitManifest, 'lessons'> & {
  lessons: LessonContent[];
  /** Repo-relative path to unit directory. */
  sourcePath: string;
};
