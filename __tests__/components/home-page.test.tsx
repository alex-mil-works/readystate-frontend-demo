import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_NAME, APP_TAGLINE, APP_TAGLINE_EN } from '@/shared/config';
import { getCourseReviewPoolByRoleStack } from '@/shared/content/generated';
import { REVIEW_DAY_MS } from '@/shared/lib/engine';
import { useProgressStore } from '@/shared/lib/store/progress-store';
import { useUiPrefsStore } from '@/shared/lib/store/ui-prefs-store';
import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';

import { HomePage } from '@/pages/home';

import { AppChromeLayout } from '@/app/layouts/AppChromeLayout';

function renderHome(path = '/courses/frontend/react') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppChromeLayout />}>
          <Route path="/courses/:roleId/:stackId" element={<HomePage />} />
        </Route>
        <Route path="/courses/:roleId/:stackId/review" element={<div>Review route</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    useUiPrefsStore.setState({
      stageExpanded: {},
      unitItemsLayout: 'micro-3',
    });
    useProgressStore.setState({ byCourseId: {}, hydrated: true });
  });
  it('defaults to React Frontend workspace and shows the lesson map', () => {
    renderHome();

    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
    expect(screen.getByText(APP_TAGLINE)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('React Frontend');
    expect(screen.queryByText(APP_TAGLINE_EN)).not.toBeInTheDocument();
    expect(screen.queryByText(/сначала выберите роль/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Плитка уроков' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('toolbar', { name: 'Представление карты' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /react frontend/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /модель значений и динамическая типизация/i }),
    ).toHaveAttribute('href', '/courses/frontend/react/lessons/L001-js-values-model');
    expect(screen.getByRole('button', { name: /настройки/i })).toHaveAttribute('href', '/settings');
    expect(screen.getByRole('button', { name: /ядро языка javascript/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: /async js и runtime/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getAllByText('Скоро').length).toBeGreaterThan(0);
    expect(screen.getByRole('complementary', { name: 'Повторение' })).toBeInTheDocument();
    expect(screen.getByText('недавно касались')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Свернуть всё' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByRole('button', { name: 'Свернуть пустые' })).not.toBeInTheDocument();
  });

  it('collapses all stages and can expand them again', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: 'Свернуть всё' }));
    expect(screen.getByRole('button', { name: /async js и runtime/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: /ядро языка javascript/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.queryByRole('link', { name: /модель значений и динамическая типизация/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Развернуть всё' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await user.click(screen.getByRole('button', { name: 'Развернуть всё' }));
    expect(screen.getByRole('button', { name: /async js и runtime/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('link', { name: /модель значений и динамическая типизация/i }),
    ).toBeInTheDocument();
  });

  it('keeps a continue stage collapsed after the header click', async () => {
    const user = userEvent.setup();
    useProgressStore.setState({
      hydrated: true,
      byCourseId: {
        'frontend/react': {
          courseId: 'frontend/react',
          roleId: 'frontend',
          stackId: 'react',
          title: 'React Frontend',
          startedLessonIds: ['L017-js-promise-states'],
          completedLessonIds: [],
          lessonTimes: { 'L017-js-promise-states': { startedAt: 1 } },
          shownRecallKeys: [],
          recallItems: {},
          updatedAt: 1,
        },
      },
    });
    useUiPrefsStore.setState({
      stageExpanded: { 'frontend/react:S02': false },
      unitItemsLayout: 'micro-3',
    });

    renderHome();

    const stage = screen.getByRole('button', { name: /async js и runtime/i });
    expect(stage).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /состояния promise/i })).toBeInTheDocument();

    await user.click(stage);

    expect(stage).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /состояния promise/i })).not.toBeInTheDocument();
  });

  it('switches lessons when the role changes without updating primary', async () => {
    const user = userEvent.setup();
    useWorkspacePrefsStore.setState({ lastRoleId: 'frontend', lastStackId: 'react' });

    renderHome('/courses/frontend/react');

    await user.click(screen.getByRole('button', { name: 'QA Automation' }));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('QA Automation (Java)');
    expect(screen.queryByText(/сначала выберите роль/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Java' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('link', { name: /модель значений/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /основы синтаксиса java/i })).toHaveAttribute(
      'href',
      '/courses/qa-automation/java/lessons/L001-java-syntax-primitives',
    );
    expect(useWorkspacePrefsStore.getState().lastRoleId).toBe('frontend');
    expect(useWorkspacePrefsStore.getState().lastStackId).toBe('react');
  });

  it('shows invalid workspace for unknown role/stack', () => {
    renderHome('/courses/nope/missing');

    expect(screen.getByRole('heading', { name: 'Курс не найден' })).toBeInTheDocument();
    expect(screen.getByText(/nope\/missing/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'На главную' })).toHaveAttribute('href', '/');
  });

  it('enables Повторение when pool cards are due (never shown)', async () => {
    const user = userEvent.setup();
    renderHome();

    const cta = screen.getByRole('button', { name: /Повторение \(\d+\)/ });
    expect(cta).toBeEnabled();
    await user.click(cta);
    expect(screen.getByText('Review route')).toBeInTheDocument();
  });

  it('disables Повторение when nothing is due', () => {
    const pool = getCourseReviewPoolByRoleStack('frontend', 'react');
    const future = Date.now() + REVIEW_DAY_MS;
    const recallItems = Object.fromEntries(
      pool.map((item) => {
        const key = item.contentUid ?? `${item.scope}:${item.id}`;
        return [key, { lastShownAt: 1, showCount: 1, dueAt: future }];
      }),
    );
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
          recallItems,
          updatedAt: Date.now(),
        },
      },
    });

    renderHome();

    expect(screen.getByRole('button', { name: 'Повторение' })).toBeDisabled();
    expect(
      screen.getByText(/Пока нечего повторять\. Пройдите уроки или загляните позже\./),
    ).toBeInTheDocument();
  });

  it('assigns lesson DOM ids for continue scroll', () => {
    renderHome();

    expect(document.getElementById('lesson-L001-js-values-model')).toBeTruthy();
  });
});
