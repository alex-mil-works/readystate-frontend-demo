import * as v from 'valibot';

export const CourseStatusSchema = v.picklist(['preview', 'coming-soon']);

export type CourseStatus = v.InferOutput<typeof CourseStatusSchema>;

/** Top-level course manifest (`.courses/<id>/course.yaml`). */
export const CourseManifestSchema = v.object({
  id: v.string(),
  title: v.string(),
  titleEn: v.string(),
  description: v.string(),
  status: CourseStatusSchema,
  statusLabel: v.string(),
  /** Relative paths to stage folders under `content/`. */
  stages: v.pipe(v.array(v.string()), v.minLength(1)),
});

export type CourseManifest = v.InferOutput<typeof CourseManifestSchema>;
