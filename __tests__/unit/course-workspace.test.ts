import { describe, expect, it } from 'vitest';

import { resolveCourseWorkspace } from '@/features/select-role-stack';

describe('resolveCourseWorkspace', () => {
  it('treats compiled available stacks as ready', () => {
    const result = resolveCourseWorkspace('frontend', 'react', {
      id: 'react',
      label: 'React',
      available: true,
    });
    expect(result.kind).toBe('ready');
  });

  it('keeps unavailable stacks as coming soon', () => {
    expect(
      resolveCourseWorkspace('frontend', 'angular', {
        id: 'angular',
        label: 'Angular',
        available: false,
      }).kind,
    ).toBe('coming_soon');
  });

  it('flags available stacks without compiled JSON as missing bundle', () => {
    expect(
      resolveCourseWorkspace('frontend', 'nope', {
        id: 'nope',
        label: 'Nope',
        available: true,
      }).kind,
    ).toBe('missing_bundle');
  });
});
