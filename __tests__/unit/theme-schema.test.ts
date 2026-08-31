import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { ThemeModeSchema, parseThemePersist } from '@/shared/lib/validation/theme';

describe('ThemeModeSchema', () => {
  it('accepts light, dark, system', () => {
    expect(v.safeParse(ThemeModeSchema, 'light').success).toBe(true);
    expect(v.safeParse(ThemeModeSchema, 'dark').success).toBe(true);
    expect(v.safeParse(ThemeModeSchema, 'system').success).toBe(true);
  });

  it('rejects unknown mode', () => {
    expect(v.safeParse(ThemeModeSchema, 'neon').success).toBe(false);
  });
});

describe('parseThemePersist', () => {
  it('parses a valid zustand persist envelope', () => {
    const raw = JSON.stringify({ state: { mode: 'dark' }, version: 0 });
    expect(parseThemePersist(raw)).toEqual({ state: { mode: 'dark' }, version: 0 });
  });

  it('returns null for invalid JSON or schema', () => {
    expect(parseThemePersist('{')).toBeNull();
    expect(parseThemePersist(JSON.stringify({ state: { mode: 'neon' } }))).toBeNull();
    expect(parseThemePersist(JSON.stringify({ mode: 'dark' }))).toBeNull();
  });
});
