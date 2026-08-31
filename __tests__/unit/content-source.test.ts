import { describe, expect, it } from 'vitest';

import {
  coursesDirForSource,
  resolveContentSource,
  resolveCoursesDirRelative,
} from '@/shared/config/content-source';

describe('content source flags', () => {
  it('defaults to local / .courses', () => {
    expect(resolveContentSource({})).toBe('local');
    expect(coursesDirForSource('local')).toBe('.courses');
    expect(resolveCoursesDirRelative({})).toBe('.courses');
  });

  it('maps VITE_DEMO=true to demo / courses-demo', () => {
    expect(resolveContentSource({ VITE_DEMO: 'true' })).toBe('demo');
    expect(resolveCoursesDirRelative({ VITE_DEMO: 'true' })).toBe('courses-demo');
  });

  it('honours explicit CONTENT_SOURCE and COURSES_DIR', () => {
    expect(resolveContentSource({ CONTENT_SOURCE: 'remote', VITE_DEMO: 'true' })).toBe('remote');
    expect(coursesDirForSource('remote')).toBe('courses-demo');
    expect(resolveCoursesDirRelative({ COURSES_DIR: 'custom-dir', VITE_DEMO: 'true' })).toBe(
      'custom-dir',
    );
  });
});
