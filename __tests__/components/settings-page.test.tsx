import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SITE_GATE_STORAGE_KEY } from '@/shared/lib/site-gate';
import { flushProgressWrites, useProgressStore } from '@/shared/lib/store/progress-store';
import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';

import { SettingsPage } from '@/pages/settings';

import { AppChromeLayout } from '@/app/layouts/AppChromeLayout';

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route element={<AppChromeLayout />}>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/courses/:roleId/:stackId" element={<div>home stub</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SettingsPage', () => {
  beforeEach(async () => {
    await useProgressStore.getState().hydrate();
    useProgressStore.getState().resetAll();
    useWorkspacePrefsStore.setState({ lastRoleId: null, lastStackId: null });
    await flushProgressWrites();
    sessionStorage.removeItem(SITE_GATE_STORAGE_KEY);
  });

  it('shows empty progress copy when nothing is started', () => {
    renderSettings();
    expect(screen.getByText(/пока нет начатых курсов/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /скачать/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /загрузить/i })).toBeInTheDocument();
    expect(screen.getByText(/скачайте файл на другое устройство/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /к курсам/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/позже здесь будет выход/i)).not.toBeInTheDocument();
  });

  it('shows primary course without reset when progress is empty', () => {
    useWorkspacePrefsStore.setState({ lastRoleId: 'frontend', lastStackId: 'react' });
    renderSettings();

    expect(screen.getByRole('link', { name: 'React Frontend' })).toHaveAttribute(
      'href',
      '/courses/frontend/react',
    );
    expect(screen.getByText('Основной')).toBeInTheDocument();
    expect(screen.getByText(/прогресс ещё не начат/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Сбросить прогресс' })).not.toBeInTheDocument();
  });

  it('lists a course, can set primary, and resets progress only', async () => {
    const user = userEvent.setup();
    useProgressStore.getState().markLessonStarted({
      courseId: 'frontend/react',
      roleId: 'frontend',
      stackId: 'react',
      title: 'React Frontend',
      lessonId: 'L001-js-values-model',
    });
    await flushProgressWrites();

    renderSettings();

    expect(screen.getByRole('link', { name: 'React Frontend' })).toHaveAttribute(
      'href',
      '/courses/frontend/react',
    );

    await user.click(screen.getByRole('button', { name: 'Сделать основным' }));
    expect(useWorkspacePrefsStore.getState().lastRoleId).toBe('frontend');
    expect(useWorkspacePrefsStore.getState().lastStackId).toBe('react');
    expect(screen.getByText('Основной')).toBeInTheDocument();
    expect(screen.getByText(/основной курс: react frontend/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Сбросить прогресс' }));
    expect(screen.getByRole('heading', { name: 'Сбросить прогресс курса?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Да, сбросить прогресс' }));
    expect(screen.getByText(/прогресс ещё не начат/i)).toBeInTheDocument();
    expect(screen.getByText('Основной')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Сбросить прогресс' })).not.toBeInTheDocument();
    expect(useWorkspacePrefsStore.getState().lastRoleId).toBe('frontend');
    expect(useWorkspacePrefsStore.getState().lastStackId).toBe('react');
  });

  it('logout clears gate session without clearing primary course', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(SITE_GATE_STORAGE_KEY, 'ok');
    useWorkspacePrefsStore.setState({ lastRoleId: 'frontend', lastStackId: 'react' });

    renderSettings();

    await user.click(screen.getByRole('button', { name: 'Выйти' }));
    await user.click(screen.getByRole('button', { name: 'Да, выйти' }));

    expect(sessionStorage.getItem(SITE_GATE_STORAGE_KEY)).toBeNull();
    expect(useWorkspacePrefsStore.getState().lastRoleId).toBe('frontend');
    expect(useWorkspacePrefsStore.getState().lastStackId).toBe('react');
  });
});
