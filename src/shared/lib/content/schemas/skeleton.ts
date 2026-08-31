import * as v from 'valibot';

/** One stage slot in the role skeleton (titles only; content lives in stacks). */
export const SkeletonStageSchema = v.object({
  id: v.string(),
  title: v.string(),
  titleEn: v.string(),
});

export type SkeletonStage = v.InferOutput<typeof SkeletonStageSchema>;

/** Role skeleton manifest (`.courses/<role>/skeleton.yaml`). */
export const SkeletonManifestSchema = v.object({
  roleId: v.string(),
  stages: v.pipe(v.array(SkeletonStageSchema), v.minLength(1)),
});

export type SkeletonManifest = v.InferOutput<typeof SkeletonManifestSchema>;
