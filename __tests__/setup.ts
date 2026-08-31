import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';

import { resetProgressDbForTests } from '@/shared/lib/progress/db';
import { useProgressStore } from '@/shared/lib/store/progress-store';

// Reset the DOM between tests (globals: false).
afterEach(async () => {
  cleanup();
  await resetProgressDbForTests();
  useProgressStore.setState({ byCourseId: {}, hydrated: false });
});
