import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';

import { OnboardingPage } from '@/pages/onboarding';

describe('OnboardingPage', () => {
  beforeEach(() => {
    useWorkspacePrefsStore.setState({ lastRoleId: null, lastStackId: null });
  });

  it('saves last workspace and opens the first lesson', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/courses/:roleId/:stackId/lessons/:lessonId"
            element={<div>lesson stub</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Frontend' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'К основному курсу' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Начать' }));

    expect(useWorkspacePrefsStore.getState().lastRoleId).toBe('frontend');
    expect(useWorkspacePrefsStore.getState().lastStackId).toBe('react');
    expect(screen.getByText('lesson stub')).toBeInTheDocument();
  });

  it('offers return to primary map when primary already exists', async () => {
    const user = userEvent.setup();
    useWorkspacePrefsStore.setState({ lastRoleId: 'frontend', lastStackId: 'react' });

    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/courses/:roleId/:stackId" element={<div>map stub</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/основной курс уже выбран/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'К основному курсу' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'QA Automation' }));
    await user.click(screen.getByRole('button', { name: 'К основному курсу' }));

    expect(useWorkspacePrefsStore.getState().lastRoleId).toBe('frontend');
    expect(useWorkspacePrefsStore.getState().lastStackId).toBe('react');
    expect(screen.getByText('map stub')).toBeInTheDocument();
  });
});
