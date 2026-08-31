import { type Page, expect, test } from '@playwright/test';

/** Soft site gate uses sessionStorage; unlock so smoke runs with or without VITE_SITE_PASSWORD. */
async function unlockSiteGate(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('readystate-site-gate', 'ok');
  });
}

async function seedLastWorkspace(page: Page) {
  await unlockSiteGate(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      'readystate-workspace-prefs',
      JSON.stringify({ state: { lastRoleId: 'frontend', lastStackId: 'react' }, version: 0 }),
    );
  });
}

async function clearWorkspace(page: Page) {
  await unlockSiteGate(page);
  await page.addInitScript(() => {
    localStorage.removeItem('readystate-workspace-prefs');
  });
}

/** First lesson on the React map — confirms compiled demo JSON loaded. */
function firstLessonLink(page: Page) {
  return page.getByRole('link', { name: /модель значений и динамическая типизация/i });
}

test.describe('smoke', () => {
  test.beforeEach(async ({ page }) => {
    await unlockSiteGate(page);
  });
  test('home redirects to last workspace and shows course map', async ({ page }) => {
    await seedLastWorkspace(page);
    await page.goto('/');

    await expect(page).toHaveURL(/\/courses\/frontend\/react\/?$/);
    await expect(page.getByText('ReadyState')).toBeVisible();
    await expect(page.getByText('Знания, готовые к интервью')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('React Frontend');
    await expect(page.getByRole('complementary', { name: 'Повторение' })).toBeVisible();
    await expect(firstLessonLink(page)).toBeVisible();
  });

  test('onboarding starts the first lesson', async ({ page }) => {
    await clearWorkspace(page);
    await page.goto('/');

    await expect(page).toHaveURL(/\/onboarding\/?$/);
    const start = page.getByRole('button', { name: 'Начать' });
    await expect(start).toBeEnabled();
    await start.click();
    await expect(page).toHaveURL(/\/courses\/frontend\/react\/lessons\/L001-js-values-model/);
    await expect(page.getByRole('button', { name: 'Далее' })).toBeVisible();
  });

  test('map and settings require onboarding', async ({ page }) => {
    await clearWorkspace(page);
    await page.goto('/courses/frontend/react');
    await expect(page).toHaveURL(/\/onboarding\/?$/);

    await page.goto('/settings');
    await expect(page).toHaveURL(/\/onboarding\/?$/);
  });

  test('opens a lesson from the map', async ({ page }) => {
    await seedLastWorkspace(page);
    await page.goto('/courses/frontend/react');

    const lesson = firstLessonLink(page);
    await expect(lesson).toBeVisible();
    await lesson.click();

    await expect(page).toHaveURL(/\/lessons\/L001-js-values-model/);
    await expect(page.getByRole('button', { name: 'Далее' })).toBeVisible();
  });

  test('unknown path shows soft 404 even without last workspace', async ({ page }) => {
    await clearWorkspace(page);
    await page.goto('/courses/react-frontend');

    await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'На главную' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('button', { name: /настройки/i })).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/onboarding/);
  });

  test('unknown path shows soft 404 with last workspace', async ({ page }) => {
    await seedLastWorkspace(page);
    await page.goto('/courses/react-frontend');

    await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'На главную' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('button', { name: /настройки/i })).toHaveCount(0);
  });

  test('unknown role/stack shows invalid workspace', async ({ page }) => {
    await seedLastWorkspace(page);
    await page.goto('/courses/nope/missing');

    await expect(page.getByRole('heading', { name: 'Курс не найден' })).toBeVisible();
    await expect(page.getByText(/nope\/missing/)).toBeVisible();
  });
});
