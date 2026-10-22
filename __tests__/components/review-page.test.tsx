import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProgressStore } from '@/shared/lib/store/progress-store';

import { ReviewPage } from '@/pages/review';

const { demoPool } = vi.hoisted(() => ({
  demoPool: [
    {
      id: 'r1',
      kind: 'single_choice' as const,
      phase: 'revision' as const,
      prompt: 'Review card one?',
      options: [
        { id: 'a', text: 'Yes', correct: true as const },
        { id: 'b', text: 'No' },
      ],
      explain: 'Yes.',
      scope: 'unit' as const,
      courseId: 'frontend/react',
      stageId: 'S01',
      unitId: 'U01',
      sourcePath: 'fixture',
      contentUid: 'uid-review-1',
    },
    {
      id: 'r2',
      kind: 'single_choice' as const,
      phase: 'revision' as const,
      prompt: 'Review card two?',
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
      contentUid: 'uid-review-2',
    },
  ],
}));

vi.mock('@/shared/content/generated', () => ({
  getCourseReviewPoolByRoleStack: () => demoPool,
  getCompiledCourseByRoleStack: () => undefined,
  getCompiledCourse: () => undefined,
  listCompiledCourses: () => [],
}));

function renderReview(path = '/courses/frontend/react/review') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/courses/:roleId/:stackId/review" element={<ReviewPage />} />
        <Route path="/courses/:roleId/:stackId" element={<div>Map</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ReviewPage', () => {
  beforeEach(() => {
    useProgressStore.setState({
      hydrated: true,
      byCourseId: {
        'frontend/react': {
          courseId: 'frontend/react',
          roleId: 'frontend',
          stackId: 'react',
          title: 'React Frontend',
          startedLessonIds: [],
          completedLessonIds: [],
          lessonTimes: {},
          shownRecallKeys: [],
          recallItems: {},
          updatedAt: Date.now(),
        },
      },
    });
  });

  it('plays a capped review session and returns to the map', async () => {
    const user = userEvent.setup();
    renderReview();

    expect(await screen.findByText(/Review card (one|two)\?/)).toBeInTheDocument();
    const firstPrompt = screen.getByText(/Review card (one|two)\?/).textContent ?? '';
    const firstIsOne = firstPrompt.includes('one');
    await user.click(screen.getByRole('option', { name: firstIsOne ? 'Yes' : 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(
      await screen.findByText(firstIsOne ? /Review card two\?/ : /Review card one\?/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: firstIsOne ? 'Alpha' : 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'Готово' }));

    expect(await screen.findByText('Повторение завершено')).toBeInTheDocument();
    expect(
      useProgressStore.getState().byCourseId['frontend/react']?.recallItems['uid-review-1'],
    ).toMatchObject({ showCount: 1 });
    await user.click(screen.getByRole('button', { name: 'К курсу' }));
    expect(screen.getByText('Map')).toBeInTheDocument();
  });

  it('selects a choice with digit keys', async () => {
    const user = userEvent.setup();
    renderReview();

    expect(await screen.findByText(/Review card (one|two)\?/)).toBeInTheDocument();
    await user.keyboard('1');
    expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled();
  });

  it('redirects to the map when the session is empty', async () => {
    const future = Date.now() + 86_400_000;
    useProgressStore.setState({
      hydrated: true,
      byCourseId: {
        'frontend/react': {
          courseId: 'frontend/react',
          roleId: 'frontend',
          stackId: 'react',
          title: 'React Frontend',
          startedLessonIds: [],
          completedLessonIds: [],
          lessonTimes: {},
          shownRecallKeys: [],
          recallItems: {
            'uid-review-1': { lastShownAt: 1, showCount: 1, dueAt: future },
            'uid-review-2': { lastShownAt: 1, showCount: 1, dueAt: future },
          },
          updatedAt: Date.now(),
        },
      },
    });

    renderReview();

    await waitFor(() => {
      expect(screen.getByText('Map')).toBeInTheDocument();
    });
  });
});
