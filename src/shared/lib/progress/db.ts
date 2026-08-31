import Dexie, { type Table } from 'dexie';

import type { LessonProgressStatus } from './document';

export type CourseRow = {
  courseId: string;
  roleId: string;
  stackId: string;
  title: string;
  updatedAt: number;
};

export type LessonRow = {
  courseId: string;
  lessonId: string;
  contentUid?: string;
  status: LessonProgressStatus;
  startedAt?: number;
  completedAt?: number;
};

export type ItemRow = {
  contentUid: string;
  courseId: string;
  kind: 'pool_activity';
  lastShownAt?: number;
  outcome?: 'correct' | 'incorrect' | 'skipped';
  dueAt?: number | null;
  showCount?: number;
};

export class ReadyStateProgressDB extends Dexie {
  courses!: Table<CourseRow, string>;
  lessons!: Table<LessonRow, [string, string]>;
  items!: Table<ItemRow, string>;

  constructor(name = 'readystate-progress') {
    super(name);
    this.version(1).stores({
      courses: 'courseId, updatedAt',
      lessons: '[courseId+lessonId], courseId, contentUid, status',
      items: 'contentUid, courseId, dueAt, lastShownAt',
    });
  }
}

let sharedDb: ReadyStateProgressDB | undefined;

/** App singleton. Tests may call `resetProgressDbForTests`. */
export function getProgressDb(): ReadyStateProgressDB {
  sharedDb ??= new ReadyStateProgressDB();
  return sharedDb;
}

export async function resetProgressDbForTests(): Promise<void> {
  if (sharedDb) {
    const name = sharedDb.name;
    sharedDb.close();
    await Dexie.delete(name);
    sharedDb = undefined;
  }
}
