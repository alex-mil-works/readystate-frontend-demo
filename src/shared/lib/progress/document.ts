import * as v from 'valibot';

import { parseOrThrow } from '@/shared/lib/content/parse-or-throw';

/** Portable progress snapshot — backup / restore; Dexie maps 1:1. */
export const PROGRESS_FORMAT = 'readystate-progress' as const;
export const PROGRESS_DOCUMENT_VERSION = 1 as const;

export const LessonProgressStatusSchema = v.picklist(['started', 'completed']);
export type LessonProgressStatus = v.InferOutput<typeof LessonProgressStatusSchema>;

export const ProgressLessonSchema = v.object({
  lessonId: v.string(),
  contentUid: v.optional(v.string()),
  status: LessonProgressStatusSchema,
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
});

export type ProgressLesson = v.InferOutput<typeof ProgressLessonSchema>;

export const ProgressItemSchema = v.object({
  contentUid: v.string(),
  kind: v.literal('pool_activity'),
  lastShownAt: v.optional(v.number()),
  outcome: v.optional(v.picklist(['correct', 'incorrect', 'skipped'])),
  dueAt: v.optional(v.nullable(v.number())),
  showCount: v.optional(v.number()),
});

export type ProgressItem = v.InferOutput<typeof ProgressItemSchema>;

export const ProgressCourseSchema = v.object({
  courseId: v.string(),
  roleId: v.string(),
  stackId: v.string(),
  title: v.string(),
  updatedAt: v.optional(v.number()),
  lessons: v.array(ProgressLessonSchema),
  items: v.array(ProgressItemSchema),
});

export type ProgressCourse = v.InferOutput<typeof ProgressCourseSchema>;

export const ProgressDocumentSchema = v.object({
  format: v.literal(PROGRESS_FORMAT),
  version: v.literal(PROGRESS_DOCUMENT_VERSION),
  exportedAt: v.string(),
  courses: v.array(ProgressCourseSchema),
});

export type ProgressDocument = v.InferOutput<typeof ProgressDocumentSchema>;

/** Parse unknown JSON into a Progress Document v1. */
export function parseProgressDocument(
  input: unknown,
  context = 'progress document',
): ProgressDocument {
  return parseOrThrow(ProgressDocumentSchema, input, context);
}

/** Parse a JSON string export. */
export function parseProgressDocumentJson(
  raw: string,
  context = 'progress document',
): ProgressDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`${context}: invalid JSON`);
  }
  return parseProgressDocument(parsed, context);
}
