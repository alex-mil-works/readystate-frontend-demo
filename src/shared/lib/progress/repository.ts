import { courseToRecord, documentToRecords, recordToCourse, recordsToDocument } from './convert';
import { type CourseRow, type ItemRow, type LessonRow, getProgressDb } from './db';
import {
  type ProgressCourse,
  type ProgressDocument,
  parseProgressDocument,
  parseProgressDocumentJson,
} from './document';
import type { CourseProgressRecord } from './progress-types';

const LEGACY_ZUSTAND_KEY = 'readystate-progress';

/** Load all courses as UI records from Dexie. */
export async function loadAllRecords(): Promise<Record<string, CourseProgressRecord>> {
  const db = getProgressDb();
  const courses = await db.courses.toArray();
  const byCourseId: Record<string, CourseProgressRecord> = {};

  for (const course of courses) {
    const lessons = await db.lessons.where('courseId').equals(course.courseId).toArray();
    const items = await db.items.where('courseId').equals(course.courseId).toArray();
    byCourseId[course.courseId] = courseToRecord(rowsToCourse(course, lessons, items));
  }

  return byCourseId;
}

/** Build export document from Dexie (source of truth). */
export async function exportProgressDocument(): Promise<ProgressDocument> {
  const records = await loadAllRecords();
  return recordsToDocument(records);
}

export async function exportProgressJson(pretty = true): Promise<string> {
  const doc = await exportProgressDocument();
  return pretty ? `${JSON.stringify(doc, null, 2)}\n` : JSON.stringify(doc);
}

/** Replace-all import from a parsed document. */
export async function importProgressDocument(doc: ProgressDocument): Promise<void> {
  const parsed = parseProgressDocument(doc);
  await replaceAllFromDocument(parsed);
}

/** Replace-all import from JSON string. */
export async function importProgressJson(raw: string): Promise<ProgressDocument> {
  const doc = parseProgressDocumentJson(raw);
  await replaceAllFromDocument(doc);
  return doc;
}

async function replaceAllFromDocument(doc: ProgressDocument): Promise<void> {
  const db = getProgressDb();
  await db.transaction('rw', db.courses, db.lessons, db.items, async () => {
    await Promise.all([db.courses.clear(), db.lessons.clear(), db.items.clear()]);
    for (const course of doc.courses) {
      await putCourse(course);
    }
  });
}

async function putCourse(course: ProgressCourse): Promise<void> {
  const db = getProgressDb();
  const updatedAt = course.updatedAt ?? Date.now();
  await db.courses.put({
    courseId: course.courseId,
    roleId: course.roleId,
    stackId: course.stackId,
    title: course.title,
    updatedAt,
  });
  await db.lessons.where('courseId').equals(course.courseId).delete();
  await db.items.where('courseId').equals(course.courseId).delete();

  if (course.lessons.length > 0) {
    await db.lessons.bulkPut(
      course.lessons.map((lesson) => ({
        courseId: course.courseId,
        lessonId: lesson.lessonId,
        contentUid: lesson.contentUid,
        status: lesson.status,
        startedAt: lesson.startedAt,
        completedAt: lesson.completedAt,
      })),
    );
  }
  if (course.items.length > 0) {
    await db.items.bulkPut(
      course.items.map((item) => ({
        contentUid: item.contentUid,
        courseId: course.courseId,
        kind: 'pool_activity' as const,
        lastShownAt: item.lastShownAt,
        outcome: item.outcome,
        dueAt: item.dueAt ?? null,
        showCount: item.showCount,
      })),
    );
  }
}

/** Persist one course record (after zustand mutation). */
export async function saveCourseRecord(record: CourseProgressRecord): Promise<void> {
  await putCourse(recordToCourse(record));
}

export async function deleteCourseRecord(courseId: string): Promise<void> {
  const db = getProgressDb();
  await db.transaction('rw', db.courses, db.lessons, db.items, async () => {
    await db.courses.delete(courseId);
    await db.lessons.where('courseId').equals(courseId).delete();
    await db.items.where('courseId').equals(courseId).delete();
  });
}

export async function clearAllProgress(): Promise<void> {
  const db = getProgressDb();
  await db.transaction('rw', db.courses, db.lessons, db.items, async () => {
    await Promise.all([db.courses.clear(), db.lessons.clear(), db.items.clear()]);
  });
}

function rowsToCourse(course: CourseRow, lessons: LessonRow[], items: ItemRow[]): ProgressCourse {
  return {
    courseId: course.courseId,
    roleId: course.roleId,
    stackId: course.stackId,
    title: course.title,
    updatedAt: course.updatedAt,
    lessons: lessons.map((lesson) => ({
      lessonId: lesson.lessonId,
      contentUid: lesson.contentUid,
      status: lesson.status,
      startedAt: lesson.startedAt,
      completedAt: lesson.completedAt,
    })),
    items: items.map((item) => ({
      contentUid: item.contentUid,
      kind: 'pool_activity' as const,
      lastShownAt: item.lastShownAt,
      outcome: item.outcome,
      dueAt: item.dueAt ?? null,
      showCount: item.showCount,
    })),
  };
}

/**
 * One-shot: if Dexie empty and legacy zustand localStorage present, migrate then remove legacy key.
 * Returns migrated records (possibly empty).
 */
export async function hydrateProgressWithLegacyMigration(): Promise<
  Record<string, CourseProgressRecord>
> {
  const db = getProgressDb();
  const existing = await db.courses.count();
  if (existing > 0) return loadAllRecords();

  const legacyRaw =
    typeof localStorage !== 'undefined' ? localStorage.getItem(LEGACY_ZUSTAND_KEY) : null;
  if (!legacyRaw) return {};

  try {
    const wrapped = JSON.parse(legacyRaw) as {
      state?: { byCourseId?: Record<string, CourseProgressRecord> };
      byCourseId?: Record<string, CourseProgressRecord>;
    };
    const byCourseId = wrapped.state?.byCourseId ?? wrapped.byCourseId ?? {};
    if (Object.keys(byCourseId).length > 0) {
      const doc = recordsToDocument(byCourseId);
      await replaceAllFromDocument(doc);
    }
  } catch {
    // Ignore corrupt legacy blob; start empty.
  }

  localStorage.removeItem(LEGACY_ZUSTAND_KEY);
  return loadAllRecords();
}

export { documentToRecords, recordsToDocument };
