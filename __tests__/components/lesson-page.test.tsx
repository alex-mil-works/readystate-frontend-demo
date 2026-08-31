import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProgressStore } from '@/shared/lib/store/progress-store';

import { LessonPage } from '@/pages/lesson';

import { demoLesson } from '../fixtures/demo-lesson';

const { demoPoolContext } = vi.hoisted(() => ({
  demoPoolContext: {
    courseId: 'frontend/react',
    stageId: 'S01',
    unitId: 'U01',
    lessonId: 'L001-js-values-model',
    unitPool: [
      {
        id: 'r-bonus-1',
        kind: 'single_choice' as const,
        phase: 'revision' as const,
        prompt: 'Bonus recall one?',
        options: [
          { id: 'a', text: 'Yes', correct: true as const },
          { id: 'b', text: 'No' },
        ],
        explain: 'Yes is correct.',
        scope: 'unit' as const,
        courseId: 'frontend/react',
        stageId: 'S01',
        unitId: 'U01',
        sourcePath: 'fixture',
        contentUid: 'uid-bonus-1',
        reinforces: ['L001-js-values-model'],
      },
      {
        id: 'r-bonus-2',
        kind: 'single_choice' as const,
        phase: 'revision' as const,
        prompt: 'Bonus recall two?',
        options: [
          { id: 'a', text: 'Alpha', correct: true as const },
          { id: 'b', text: 'Beta' },
        ],
        explain: 'Alpha.',
        scope: 'unit' as const,
        courseId: 'frontend/react',
        stageId: 'S01',
        unitId: 'U01',
        sourcePath: 'fixture',
        contentUid: 'uid-bonus-2',
      },
    ],
    stagePool: [] as [],
    coursePool: [] as [],
  },
}));

vi.mock('@/shared/content/generated', () => ({
  getCompiledLessonByRoleStack: (roleId: string, stackId: string, lessonId: string) => {
    if (roleId === 'frontend' && stackId === 'react' && lessonId === 'L001-js-values-model') {
      return demoLesson;
    }
    return undefined;
  },
  getCompiledCourse: () => undefined,
  getCompiledCourseByRoleStack: () => undefined,
  listCompiledCourses: () => [],
  getLessonPoolContextByRoleStack: () => demoPoolContext,
}));

function renderLesson(path = '/courses/frontend/react/lessons/L001-js-values-model') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/courses/:roleId/:stackId/lessons/:lessonId" element={<LessonPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LessonPage', () => {
  beforeEach(() => {
    useProgressStore.getState().resetAll();
  });
  it('shows lesson title, first insight, and allows back/forward between steps', async () => {
    const user = userEvent.setup();
    renderLesson();

    expect(screen.getByText('Demo lesson title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'First insight' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('heading', { name: 'Second insight' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Назад' }));
    expect(screen.getByRole('heading', { name: 'First insight' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByRole('heading', { name: 'Second insight' })).toBeInTheDocument();
  });

  it('keeps Далее disabled on a choice step until an option is selected', async () => {
    const user = userEvent.setup();
    renderLesson();

    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(screen.getByText('Solve')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();

    await user.click(
      screen.getByRole('option', {
        name: /correct option about values/i,
      }),
    );

    expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled();
    expect(screen.getByText(/the correct option is about values/i)).toBeInTheDocument();
  });

  it('marks the current step invalid when the chosen option is wrong', async () => {
    const user = userEvent.setup();
    renderLesson();

    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('option', { name: /wrong option a/i }));

    expect(screen.getByRole('button', { name: 'Шаг 3 из 4' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('opens Recall hint dialog with theory snippets', async () => {
    const user = userEvent.setup();
    renderLesson();

    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('option', { name: /correct option about values/i }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(screen.getByText('Recall')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Подсказка' }));
    expect(screen.getByRole('heading', { name: 'Теория' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Binding vs mutation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument();
  });

  it('redirects short legacy lesson id to semantic id', () => {
    renderLesson('/courses/frontend/react/lessons/L001');
    expect(screen.getByText('Demo lesson title')).toBeInTheDocument();
  });

  it('renders fallback when the lesson is not compiled', () => {
    renderLesson('/courses/frontend/react/lessons/missing');

    expect(screen.getByRole('heading', { name: 'Урок пока недоступен' })).toBeInTheDocument();
  });

  it('offers post-lesson +2 Recall from the unit pool', async () => {
    const user = userEvent.setup();
    renderLesson();

    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('option', { name: /correct option about values/i }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));
    await user.click(screen.getByRole('option', { name: /because const binds the reference/i }));
    await user.click(screen.getByRole('button', { name: 'Завершить' }));

    expect(screen.getByRole('heading', { name: 'Урок пройден' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ещё 2 Recall/i }));

    expect(screen.getByText('Ещё Recall')).toBeInTheDocument();
    expect(screen.getByText(/Bonus recall one/i)).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'No' }));
    expect(
      screen.getByRole('list', { name: 'Bonus Recall' }).querySelector('[aria-invalid="true"]'),
    ).toBeTruthy();

    await user.click(screen.getByRole('option', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));
    expect(screen.getByText(/Bonus recall two/i)).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Готово' }));
    expect(screen.getByRole('heading', { name: 'Урок пройден' })).toBeInTheDocument();
  });
});
