import type { Activity, ActivityHint } from '@/shared/lib/content';

/** Theory hints for revision activities (footer «Подсказка», not inside the card). */
export function getActivityTheoryHints(activity: Activity): ActivityHint[] | null {
  if (activity.phase === 'revision' && activity.hints && activity.hints.length > 0) {
    return activity.hints;
  }
  return null;
}
