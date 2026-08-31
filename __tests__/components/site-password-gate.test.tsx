import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SITE_GATE_STORAGE_KEY, lockSiteGate, unlockSiteGate } from '@/shared/lib/site-gate';

import { SitePasswordGate } from '@/app/providers/SitePasswordGate';

describe('SitePasswordGate', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders children when no password is configured', () => {
    render(
      <SitePasswordGate>
        <p>app</p>
      </SitePasswordGate>,
    );
    expect(screen.getByText('app')).toBeInTheDocument();
    expect(screen.queryByLabelText('Пароль')).not.toBeInTheDocument();
  });

  it('blocks until the shared password is entered, then shows the app', async () => {
    const user = userEvent.setup();
    sessionStorage.clear();

    render(
      <SitePasswordGate expectedPassword="demo">
        <p>app</p>
      </SitePasswordGate>,
    );

    expect(screen.queryByText('app')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Пароль'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Войти' }));
    expect(screen.getByText('Неверный пароль')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Пароль'));
    await user.type(screen.getByLabelText('Пароль'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(sessionStorage.getItem(SITE_GATE_STORAGE_KEY)).toBe('ok');
    expect(screen.getByText('app')).toBeInTheDocument();
  });

  it('returns to the password form when the gate is locked without reload', async () => {
    unlockSiteGate();

    render(
      <SitePasswordGate expectedPassword="demo">
        <p>app</p>
      </SitePasswordGate>,
    );

    expect(screen.getByText('app')).toBeInTheDocument();

    lockSiteGate();

    expect(await screen.findByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.queryByText('app')).not.toBeInTheDocument();
  });
});
