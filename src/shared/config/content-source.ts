/** Where lesson bundles come from at build / runtime. */
export type ContentSource = 'local' | 'demo' | 'remote';

type ContentSourceEnv = {
  CONTENT_SOURCE?: string;
  VITE_CONTENT_SOURCE?: string;
  VITE_DEMO?: string;
  COURSES_DIR?: string;
};

/** Resolve content source from env (Node compile or Vite). */
export function resolveContentSource(env: ContentSourceEnv = {}): ContentSource {
  const explicit = env.CONTENT_SOURCE ?? env.VITE_CONTENT_SOURCE;
  if (explicit === 'local' || explicit === 'demo' || explicit === 'remote') return explicit;
  if (env.VITE_DEMO === 'true') return 'demo';
  return 'local';
}

/**
 * Repo-relative authoring root for the compiler.
 * `remote` falls back to `courses-demo` until a backend exists.
 */
export function coursesDirForSource(source: ContentSource): string {
  if (source === 'demo' || source === 'remote') return 'courses-demo';
  return '.courses';
}

/** Prefer explicit `COURSES_DIR`, else derive from content source flags. */
export function resolveCoursesDirRelative(env: ContentSourceEnv = {}): string {
  if (env.COURSES_DIR && env.COURSES_DIR.trim() !== '') return env.COURSES_DIR.trim();
  return coursesDirForSource(resolveContentSource(env));
}

function viteEnvBag(): ContentSourceEnv {
  // Vite defines `import.meta.env`; Node/tsx leaves it undefined.
  const env = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env;
  return {
    VITE_CONTENT_SOURCE: env?.VITE_CONTENT_SOURCE,
    VITE_DEMO: env?.VITE_DEMO,
  };
}

/** Browser / Vite build flags (safe to import from the compiler for pure helpers). */
export const CONTENT_SOURCE: ContentSource = resolveContentSource(viteEnvBag());

/** True when this build is the public demo slice. */
export const IS_DEMO_BUILD = CONTENT_SOURCE === 'demo';
