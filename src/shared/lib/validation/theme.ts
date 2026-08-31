import * as v from 'valibot';

/** Theme preference. */
export const ThemeModeSchema = v.picklist(['light', 'dark', 'system']);

export type ThemeMode = v.InferOutput<typeof ThemeModeSchema>;

/** Zustand persist payload. Trust boundary: storage string → typed state. */
export const ThemePersistSchema = v.object({
  state: v.object({
    mode: ThemeModeSchema,
  }),
  version: v.optional(v.number()),
});

export type ThemePersist = v.InferOutput<typeof ThemePersistSchema>;

/** Parse persisted theme JSON. Returns null if the value is corrupt. */
export function parseThemePersist(raw: string): ThemePersist | null {
  try {
    const json: unknown = JSON.parse(raw);
    const result = v.safeParse(ThemePersistSchema, json);
    return result.success ? result.output : null;
  } catch {
    return null;
  }
}
