import { Badge } from '@/shared/ui/kit';

import { type LessonStep, insightBodyMarkdown } from '../model/steps';
import { LessonMarkdown } from './LessonMarkdown';

/** Step role pill: Read. */
const INSIGHT_BADGE = 'Read';

export function InsightStep({ step }: { step: Extract<LessonStep, { kind: 'insight' }> }) {
  const { insight } = step;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Badge className="bg-success text-success-foreground">{INSIGHT_BADGE}</Badge>
        {insight.minutes ? (
          <span className="text-muted-foreground text-xs tabular-nums">~{insight.minutes} мин</span>
        ) : null}
      </div>
      <h1 className="text-foreground m-0 text-2xl font-medium tracking-tight">{insight.title}</h1>
      <div className="mt-4">
        <LessonMarkdown>{insightBodyMarkdown(insight)}</LessonMarkdown>
      </div>
    </div>
  );
}
