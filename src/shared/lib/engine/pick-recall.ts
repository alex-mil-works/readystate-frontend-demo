import type { PoolActivity, PoolScope } from '@/shared/lib/content';

export type PickRecallOptions = {
  /** How many cards to return. */
  n: number;
  /** Pool scope this pick is for (filters + scoring context). */
  scope: PoolScope;
  /** Candidate bank (already scoped by caller when needed). */
  pool: PoolActivity[];
  /** Prefer cards that reinforce this lesson id. */
  lessonId?: string;
  /** contentUid / id recently shown — down-ranked. */
  recentlyShown?: string[];
  /** Hard-exclude these contentUid / id values. */
  excludeIds?: string[];
  /** Default: only `revision` (Recall). Pass `['revision','phrasing']` for Review packs. */
  phases?: Array<'revision' | 'phrasing' | 'practice'>;
  /** Optional RNG for tie-breaks (tests inject). */
  random?: () => number;
};

function activityKey(item: PoolActivity): string {
  return item.contentUid ?? `${item.scope}:${item.id}`;
}

function scoreItem(
  item: PoolActivity,
  opts: {
    lessonId?: string;
    recentlyShown: Set<string>;
    scope: PoolScope;
  },
): number {
  let score = 0;
  const key = activityKey(item);

  if (opts.recentlyShown.has(key) || opts.recentlyShown.has(item.id)) {
    score -= 100;
  } else {
    score += 10;
  }

  if (opts.lessonId && item.reinforces?.includes(opts.lessonId)) {
    score += 50;
  }

  // Prefer matching requested scope when mixed banks are passed.
  if (item.scope === opts.scope) {
    score += 5;
  }

  return score;
}

/**
 * Pick up to `n` Recall/Speak cards from a pool.
 * Pure scheduler stub until Dexie dueAt exists — down-ranks recent ids, boosts reinforces.
 */
export function pickRecall(options: PickRecallOptions): PoolActivity[] {
  const {
    n,
    scope,
    pool,
    lessonId,
    recentlyShown = [],
    excludeIds = [],
    phases = ['revision'],
    random = Math.random,
  } = options;

  if (n <= 0 || pool.length === 0) return [];

  const recent = new Set(recentlyShown);
  const excluded = new Set(excludeIds);
  const phaseSet = new Set(phases);

  const candidates = pool.filter((item) => {
    if (!phaseSet.has(item.phase)) return false;
    const key = activityKey(item);
    if (excluded.has(key) || excluded.has(item.id)) return false;
    return true;
  });

  const ranked = candidates
    .map((item, index) => ({
      item,
      score: scoreItem(item, { lessonId, recentlyShown: recent, scope }),
      // Stable-ish tie-break with optional RNG so repeats aren't always first YAML file.
      tie: random() + index * 1e-9,
    }))
    .toSorted((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.tie - right.tie;
    });

  return ranked.slice(0, n).map((entry) => entry.item);
}

/** Keys used for recent-shown tracking. */
export function poolActivityKeys(items: PoolActivity[]): string[] {
  return items.map(activityKey);
}
