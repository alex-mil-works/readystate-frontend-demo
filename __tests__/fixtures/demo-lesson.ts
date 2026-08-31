import type { LessonContent } from '@/shared/lib/content';

/** Synthetic lesson for UI tests. Not real curriculum. */
export const demoLesson: LessonContent = {
  id: 'L001-js-values-model',
  order: 1,
  title: 'Demo lesson title',
  titleEn: 'Demo lesson title',
  essence: 'Synthetic fixture for player tests.',
  depth: 'mechanism',
  required: true,
  insights: [
    {
      id: 'i01',
      kind: 'insight',
      title: 'First insight',
      minutes: 1,
      markdown: 'Body of the first insight.',
      sourcePath: 'fixture',
    },
    {
      id: 'i02',
      kind: 'insight',
      title: 'Second insight',
      minutes: 1,
      markdown: 'Body of the second insight.',
      sourcePath: 'fixture',
    },
  ],
  activities: [
    {
      id: 'p01',
      kind: 'single_choice',
      phase: 'practice',
      prompt: 'Which statement is true?',
      options: [
        { id: 'a', text: 'Wrong option A' },
        { id: 'b', text: 'Correct option about values', correct: true },
        { id: 'c', text: 'Wrong option C' },
      ],
      explain: 'The correct option is about values.',
    },
    {
      id: 'r01',
      kind: 'single_choice',
      phase: 'revision',
      prompt: 'Why does const allow mutating a field?',
      options: [
        { id: 'a', text: 'Because const binds the reference', correct: true },
        { id: 'b', text: 'Because objects are immutable' },
      ],
      explain: 'const fixes the binding, not the object.',
      hints: [
        {
          title: 'Binding vs mutation',
          markdown: 'const locks the binding. The object behind a reference can still change.',
        },
      ],
    },
  ],
};
