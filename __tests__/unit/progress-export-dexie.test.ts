import { beforeEach, describe, expect, it } from 'vitest';

import { documentToRecords, recordsToDocument } from '@/shared/lib/progress/convert';
import { parseProgressDocumentJson } from '@/shared/lib/progress/document';
import type { CourseProgressRecord } from '@/shared/lib/progress/progress-types';
import {
  exportProgressJson,
  importProgressJson,
  loadAllRecords,
  saveCourseRecord,
} from '@/shared/lib/progress/repository';
import { flushProgressWrites, useProgressStore } from '@/shared/lib/store/progress-store';

const sample: CourseProgressRecord = {
  courseId: 'frontend/react',
  roleId: 'frontend',
  stackId: 'react',
  title: 'React Frontend',
  startedLessonIds: ['L001-js-values-model', 'L002-coercion'],
  completedLessonIds: ['L001-js-values-model'],
  lessonTimes: {
    'L001-js-values-model': { startedAt: 1_700_000_000_000, completedAt: 1_700_000_000_000 },
    'L002-coercion': { startedAt: 1_700_000_000_000 },
  },
  shownRecallKeys: ['uid-a', 'uid-b'],
  updatedAt: 1_700_000_000_000,
};

describe('progress document convert', () => {
  it('round-trips records through Progress Document v1', () => {
    const doc = recordsToDocument({ [sample.courseId]: sample });
    expect(doc.format).toBe('readystate-progress');
    expect(doc.version).toBe(1);
    expect(doc.courses[0]?.lessons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ lessonId: 'L001-js-values-model', status: 'completed' }),
        expect.objectContaining({ lessonId: 'L002-coercion', status: 'started' }),
      ]),
    );
    expect(doc.courses[0]?.items.map((item) => item.contentUid)).toEqual(['uid-a', 'uid-b']);

    const back = documentToRecords(doc)[sample.courseId];
    expect(back?.completedLessonIds).toEqual(['L001-js-values-model']);
    expect(back?.startedLessonIds).toEqual(['L001-js-values-model', 'L002-coercion']);
    expect(back?.shownRecallKeys).toEqual(['uid-a', 'uid-b']);
    expect(back?.lessonTimes['L001-js-values-model']?.completedAt).toBe(1_700_000_000_000);
    expect(back?.lessonTimes['L002-coercion']?.startedAt).toBe(1_700_000_000_000);
  });

  it('rejects invalid JSON envelope', () => {
    expect(() => parseProgressDocumentJson('{"format":"nope"}')).toThrow(/progress document/);
  });
});

describe('dexie repository + export/import', () => {
  beforeEach(async () => {
    await useProgressStore.getState().hydrate();
  });

  it('persists to Dexie and exports the same snapshot', async () => {
    await saveCourseRecord(sample);
    const loaded = await loadAllRecords();
    expect(loaded[sample.courseId]?.completedLessonIds).toEqual(['L001-js-values-model']);
    expect(loaded[sample.courseId]?.lessonTimes['L001-js-values-model']?.completedAt).toBe(
      1_700_000_000_000,
    );
    expect(loaded[sample.courseId]?.lessonTimes['L002-coercion']?.startedAt).toBe(
      1_700_000_000_000,
    );

    const json = await exportProgressJson();
    const doc = parseProgressDocumentJson(json);
    expect(doc.courses).toHaveLength(1);
    expect(doc.courses[0]?.courseId).toBe('frontend/react');
    expect(doc.courses[0]?.lessons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lessonId: 'L001-js-values-model',
          status: 'completed',
          completedAt: 1_700_000_000_000,
          startedAt: 1_700_000_000_000,
        }),
        expect.objectContaining({
          lessonId: 'L002-coercion',
          status: 'started',
          startedAt: 1_700_000_000_000,
        }),
      ]),
    );

    await importProgressJson(json);
    const reloaded = await loadAllRecords();
    expect(reloaded[sample.courseId]?.lessonTimes['L001-js-values-model']).toEqual({
      startedAt: 1_700_000_000_000,
      completedAt: 1_700_000_000_000,
    });
    expect(reloaded[sample.courseId]?.lessonTimes['L002-coercion']?.startedAt).toBe(
      1_700_000_000_000,
    );
  });

  it('replace-all import clears previous Dexie state', async () => {
    await saveCourseRecord(sample);
    await saveCourseRecord({
      ...sample,
      courseId: 'qa-automation/java',
      roleId: 'qa-automation',
      stackId: 'java',
      title: 'QA Automation (Java)',
    });

    const replacement = recordsToDocument({
      'frontend/react': {
        ...sample,
        completedLessonIds: ['L001-js-values-model', 'L002-coercion'],
        startedLessonIds: ['L001-js-values-model', 'L002-coercion'],
        shownRecallKeys: ['uid-only'],
      },
    });

    await importProgressJson(JSON.stringify(replacement));
    const loaded = await loadAllRecords();
    expect(Object.keys(loaded)).toEqual(['frontend/react']);
    expect(loaded['frontend/react']?.completedLessonIds).toEqual([
      'L001-js-values-model',
      'L002-coercion',
    ]);
    expect(loaded['frontend/react']?.shownRecallKeys).toEqual(['uid-only']);
  });

  it('store export/import stays in sync with Dexie', async () => {
    const store = useProgressStore.getState();
    store.markLessonStarted({
      courseId: 'frontend/react',
      roleId: 'frontend',
      stackId: 'react',
      title: 'React Frontend',
      lessonId: 'L001-js-values-model',
    });
    store.markLessonCompleted({
      courseId: 'frontend/react',
      roleId: 'frontend',
      stackId: 'react',
      title: 'React Frontend',
      lessonId: 'L001-js-values-model',
    });
    store.markRecallShown('frontend/react', ['pool-uid-1']);
    await flushProgressWrites();

    const json = await store.exportToJson();
    store.resetAll();
    await flushProgressWrites();
    expect(useProgressStore.getState().byCourseId).toEqual({});

    await store.importFromJson(json);
    const after = useProgressStore.getState().byCourseId['frontend/react'];
    expect(after?.completedLessonIds).toContain('L001-js-values-model');
    expect(after?.shownRecallKeys).toContain('pool-uid-1');
    expect(after?.lessonTimes['L001-js-values-model']?.completedAt).toEqual(expect.any(Number));
    expect(after?.lessonTimes['L001-js-values-model']?.startedAt).toEqual(expect.any(Number));

    const fromDb = await loadAllRecords();
    expect(fromDb['frontend/react']?.shownRecallKeys).toContain('pool-uid-1');
    expect(fromDb['frontend/react']?.lessonTimes['L001-js-values-model']?.completedAt).toEqual(
      expect.any(Number),
    );
  });
});
