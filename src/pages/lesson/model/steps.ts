import type { Activity, Insight, LessonContent } from '@/shared/lib/content';

/** One card in a lesson: Read (insight) or Solve/Recall/Speak (activity). */
export type LessonStep =
  | { kind: 'insight'; id: string; insight: Insight }
  | { kind: 'activity'; id: string; activity: Activity };

export function lessonToSteps(lesson: LessonContent): LessonStep[] {
  return [
    ...lesson.insights.map((insight) => ({
      kind: 'insight' as const,
      id: `insight:${insight.id}`,
      insight,
    })),
    ...lesson.activities.map((activity) => ({
      kind: 'activity' as const,
      id: `activity:${activity.id}`,
      activity,
    })),
  ];
}

/** How the top step bar should look after an answer. Insights stay ok once reached. */
export type StepTone = 'neutral' | 'ok' | 'error';

export function activityAnswerTone(activity: Activity, selectedId: string | undefined): StepTone {
  if (activity.kind === 'interview_phrasing') return 'neutral';
  if (!selectedId) return 'neutral';

  const options = activity.kind === 'single_choice' ? activity.options : activity.choices;
  const selected = options.find((option) => option.id === selectedId);
  return selected?.correct === true ? 'ok' : 'error';
}

export function stepAnswerTone(step: LessonStep, answers: Record<string, string>): StepTone {
  if (step.kind === 'insight') return 'ok';
  return activityAnswerTone(step.activity, answers[step.id]);
}

export function insightBodyMarkdown(insight: Insight): string {
  const heading = `# ${insight.title}`;
  const markdown = insight.markdown.trim();
  if (markdown.startsWith(heading)) {
    return markdown.slice(heading.length).trim();
  }
  return markdown.replace(/^# .+\n+/, '');
}
