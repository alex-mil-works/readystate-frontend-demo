/** Per-lesson activity timestamps for warmth (and export). */
export type LessonTimeEntry = {
  startedAt?: number;
  completedAt?: number;
};

/** Per pool-card schedule (A1 intervals). Key = contentUid. */
export type RecallItemState = {
  lastShownAt: number;
  showCount: number;
  dueAt: number | null;
};

/** Local lesson progress shape shared by store, Dexie adapter, and export. */
export type CourseProgressRecord = {
  courseId: string;
  roleId: string;
  stackId: string;
  title: string;
  startedLessonIds: string[];
  completedLessonIds: string[];
  /** Per-lesson start/complete times. Missing keys fall back to `updatedAt` when resolving warmth. */
  lessonTimes: Record<string, LessonTimeEntry>;
  /** Recently shown pool Recall/Speak keys (contentUid preferred). Cap ~40. */
  shownRecallKeys: string[];
  /** Due schedule by contentUid (survives export/import via Progress items). */
  recallItems: Record<string, RecallItemState>;
  updatedAt: number;
};
