import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NotFoundPage } from '@/pages/not-found';

import { AppChromeLayout } from '@/app/layouts/AppChromeLayout';

describe('NotFoundPage', () => {
  it('renders a branded 404 with a link home', () => {
    render(
      <MemoryRouter initialEntries={['/courses/react-frontend']}>
        <Routes>
          <Route element={<AppChromeLayout />}>
            <Route path="/courses/:roleId/:stackId" element={<div>workspace</div>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'На главную' })).toHaveAttribute('href', '/');
  });
});
