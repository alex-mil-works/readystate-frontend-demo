import type {
  CourseProgressRecord,
  LessonTimeEntry,
  RecallItemState,
} from '@/shared/lib/progress/progress-types';

import {
  PROGRESS_DOCUMENT_VERSION,
  PROGRESS_FORMAT,
  type ProgressCourse,
  type ProgressDocument,
  type ProgressItem,
  type ProgressLesson,
} from './document';

const MAX_SHOWN_RECALL_KEYS = 40;

/** Build portable document from in-memory course records. */
export function recordsToDocument(
  byCourseId: Record<string, CourseProgressRecord>,
  exportedAt = new Date().toISOString(),
): ProgressDocument {
  const courses = Object.values(byCourseId)
    .map(recordToCourse)
    .toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  return {
    format: PROGRESS_FORMAT,
    version: PROGRESS_DOCUMENT_VERSION,
    exportedAt,
    courses,
  };
}

export function recordToCourse(record: CourseProgressRecord): ProgressCourse {
  const completed = new Set(record.completedLessonIds);
  const lessons: ProgressLesson[] = [];
  const times = record.lessonTimes ?? {};

  for (const lessonId of record.completedLessonIds) {
    const entry = times[lessonId];
    lessons.push({
      lessonId,
      status: 'completed',
      completedAt: entry?.completedAt ?? record.updatedAt,
      startedAt: entry?.startedAt ?? entry?.completedAt ?? record.updatedAt,
    });
  }
  for (const lessonId of record.startedLessonIds) {
    if (completed.has(lessonId)) continue;
    const entry = times[lessonId];
    lessons.push({
      lessonId,
      status: 'started',
      startedAt: entry?.startedAt ?? record.updatedAt,
    });
  }

  const recallItems = record.recallItems ?? {};
  const itemUids = new Set<string>([...Object.keys(recallItems), ...record.shownRecallKeys]);

  const items: ProgressItem[] = [...itemUids].map((contentUid) => {
    const scheduled = recallItems[contentUid];
    const shownIndex = record.shownRecallKeys.indexOf(contentUid);
    return {
      contentUid,
      kind: 'pool_activity' as const,
      lastShownAt:
        scheduled?.lastShownAt ??
        (shownIndex >= 0 ? record.updatedAt - shownIndex : record.updatedAt),
      showCount: scheduled?.showCount ?? 1,
      dueAt: scheduled?.dueAt ?? null,
    };
  });

  return {
    courseId: record.courseId,
    roleId: record.roleId,
    stackId: record.stackId,
    title: record.title,
    updatedAt: record.updatedAt,
    lessons,
    items,
  };
}

/** Replace-all projection: document → course records for the UI store. */
export function documentToRecords(doc: ProgressDocument): Record<string, CourseProgressRecord> {
  const byCourseId: Record<string, CourseProgressRecord> = {};
  for (const course of doc.courses) {
    byCourseId[course.courseId] = courseToRecord(course);
  }
  return byCourseId;
}

export function courseToRecord(course: ProgressCourse): CourseProgressRecord {
  const startedLessonIds: string[] = [];
  const completedLessonIds: string[] = [];
  const lessonTimes: Record<string, LessonTimeEntry> = {};

  for (const lesson of course.lessons) {
    const entry: LessonTimeEntry = {
      startedAt: lesson.startedAt,
      completedAt: lesson.completedAt,
    };
    lessonTimes[lesson.lessonId] = entry;

    if (lesson.status === 'completed') {
      completedLessonIds.push(lesson.lessonId);
      if (!startedLessonIds.includes(lesson.lessonId)) startedLessonIds.push(lesson.lessonId);
    } else if (!startedLessonIds.includes(lesson.lessonId)) {
      startedLessonIds.push(lesson.lessonId);
    }
  }

  const shownRecallKeys = course.items
    .slice()
    .toSorted((a, b) => (b.lastShownAt ?? 0) - (a.lastShownAt ?? 0))
    .map((item) => item.contentUid)
    .filter((uid, index, all) => all.indexOf(uid) === index)
    .slice(0, MAX_SHOWN_RECALL_KEYS);

  const recallItems: Record<string, RecallItemState> = {};
  for (const item of course.items) {
    recallItems[item.contentUid] = {
      lastShownAt: item.lastShownAt ?? course.updatedAt ?? Date.now(),
      showCount: item.showCount ?? 1,
      dueAt: item.dueAt ?? null,
    };
  }

  return {
    courseId: course.courseId,
    roleId: course.roleId,
    stackId: course.stackId,
    title: course.title,
    startedLessonIds,
    completedLessonIds,
    lessonTimes,
    shownRecallKeys,
    recallItems,
    updatedAt: course.updatedAt ?? Date.now(),
  };
}

export { MAX_SHOWN_RECALL_KEYS };
