import * as v from 'valibot';

import type { UnitContent } from './unit';

/** Stage manifest (`content/<stage>/stage.yaml`). */
export const StageManifestSchema = v.object({
  id: v.string(),
  title: v.string(),
  titleEn: v.string(),
  /** Relative unit folder names under this stage directory. */
  units: v.pipe(v.array(v.string()), v.minLength(1)),
  /** Relative path to stage repeat-pool folder. */
  activities: v.optional(v.string()),
});

export type StageManifest = v.InferOutput<typeof StageManifestSchema>;

export type StageContent = Omit<StageManifest, 'units'> & {
  units: UnitContent[];
  sourcePath: string;
};
