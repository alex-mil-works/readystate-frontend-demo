import * as v from 'valibot';

import type { Activity } from './activity';
import type { Insight } from './insight';

export const LessonDepthSchema = v.picklist([
  'mechanism',
  'application',
  'trace',
  'debug',
  'perf',
  'security',
  'tradeoff',
]);

export type LessonDepth = v.InferOutput<typeof LessonDepthSchema>;

export const LessonManifestSchema = v.object({
  id: v.string(),
  order: v.pipe(v.number(), v.integer(), v.minValue(1)),
  title: v.string(),
  titleEn: v.string(),
  essence: v.string(),
  depth: LessonDepthSchema,
  required: v.boolean(),
  insights: v.pipe(v.array(v.string()), v.minLength(1)),
  activities: v.pipe(v.array(v.string()), v.minLength(1)),
});

export type LessonManifest = v.InferOutput<typeof LessonManifestSchema>;

export type LessonContent = Omit<LessonManifest, 'insights' | 'activities'> & {
  insights: Insight[];
  activities: Activity[];
  unitId?: string;
  stageId?: string;
  /** Stable Dexie key segment; set by compiler from role/stack/stage/unit/lesson ids. */
  contentUid?: string;
};
