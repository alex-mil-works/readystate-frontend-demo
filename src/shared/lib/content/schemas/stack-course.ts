import * as v from 'valibot';

import { CourseStatusSchema } from './course';

/** Stack course manifest (`<root>/<role>/stacks/<stack>/course.yaml` on backend). */
export const StackCourseManifestSchema = v.object({
  stackId: v.string(),
  title: v.string(),
  titleEn: v.string(),
  description: v.string(),
  status: CourseStatusSchema,
  statusLabel: v.string(),
  /** Relative stage folder paths under `content/`. */
  stages: v.array(v.string()),
});

export type StackCourseManifest = v.InferOutput<typeof StackCourseManifestSchema>;
