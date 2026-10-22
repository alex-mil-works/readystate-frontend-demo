import * as v from 'valibot';

/** Stack entry inside a role discipline manifest. */
export const DisciplineStackEntrySchema = v.object({
  id: v.string(),
  label: v.string(),
  available: v.optional(v.boolean()),
});

export type DisciplineStackEntry = v.InferOutput<typeof DisciplineStackEntrySchema>;

/** Role discipline manifest (`<root>/<role>/discipline.yaml` on backend). */
export const DisciplineManifestSchema = v.object({
  roleId: v.string(),
  title: v.string(),
  titleEn: v.string(),
  stacks: v.pipe(v.array(DisciplineStackEntrySchema), v.minLength(1)),
});

export type DisciplineManifest = v.InferOutput<typeof DisciplineManifestSchema>;
