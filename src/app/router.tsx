import { createBrowserRouter } from 'react-router';

import { HomePage, IndexRedirect } from '@/pages/home';
import { LessonPage } from '@/pages/lesson';
import { NotFoundPage } from '@/pages/not-found';
import { OnboardingPage } from '@/pages/onboarding';
import { SettingsPage } from '@/pages/settings';

import { AppChromeLayout } from './layouts/AppChromeLayout';
import { RequireWorkspace } from './layouts/RequireWorkspace';
import { RootLayout } from './layouts/RootLayout';

/** App routes: password gate → onboarding / primary course → map & lessons. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <IndexRedirect />,
      },
      {
        path: 'onboarding',
        element: <OnboardingPage />,
      },
      {
        element: <RequireWorkspace />,
        children: [
          {
            path: 'courses/:roleId/:stackId/lessons/:lessonId',
            element: <LessonPage />,
          },
          {
            element: <AppChromeLayout />,
            children: [
              {
                path: 'courses/:roleId/:stackId',
                element: <HomePage />,
              },
              {
                path: 'settings',
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
      {
        element: <AppChromeLayout hideSettings />,
        children: [
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
