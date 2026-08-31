import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';

import { RequireWorkspace } from '@/app/layouts/RequireWorkspace';

describe('RequireWorkspace', () => {
  beforeEach(() => {
    useWorkspacePrefsStore.setState({ lastRoleId: null, lastStackId: null });
    useWorkspacePrefsStore.persist.rehydrate();
  });

  it('redirects to onboarding when no last workspace is saved', async () => {
    render(
      <MemoryRouter initialEntries={['/courses/frontend/react']}>
        <Routes>
          <Route element={<RequireWorkspace />}>
            <Route path="/courses/:roleId/:stackId" element={<div>map</div>} />
          </Route>
          <Route path="/onboarding" element={<div>onboarding</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('onboarding')).toBeInTheDocument();
    expect(screen.queryByText('map')).not.toBeInTheDocument();
  });

  it('renders workspace routes when last role/stack exists', async () => {
    useWorkspacePrefsStore.setState({ lastRoleId: 'frontend', lastStackId: 'react' });

    render(
      <MemoryRouter initialEntries={['/courses/frontend/react']}>
        <Routes>
          <Route element={<RequireWorkspace />}>
            <Route path="/courses/:roleId/:stackId" element={<div>map</div>} />
          </Route>
          <Route path="/onboarding" element={<div>onboarding</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('map')).toBeInTheDocument();
  });
});
