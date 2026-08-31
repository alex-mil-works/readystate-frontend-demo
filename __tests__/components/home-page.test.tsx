import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_NAME, APP_TAGLINE, APP_TAGLINE_EN } from '@/shared/config';
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
      'false',
    );
    expect(screen.getAllByText('Скоро').length).toBeGreaterThan(0);
    expect(screen.getByRole('complementary', { name: 'Повторение' })).toBeInTheDocument();
    expect(screen.getByText('недавно касались')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Развернуть всё' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.queryByRole('button', { name: 'Свернуть пустые' })).not.toBeInTheDocument();
  });

  it('expands all stages and can collapse them again', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: 'Развернуть всё' }));
    expect(screen.getByRole('button', { name: /async js и runtime/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Свернуть всё' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Свернуть всё' }));
    expect(screen.getByRole('button', { name: /async js и runtime/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: /ядро языка javascript/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
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
});
