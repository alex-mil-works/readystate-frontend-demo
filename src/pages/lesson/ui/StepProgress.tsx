import { cn } from '@/shared/lib/utils';

import type { LessonStep, StepTone } from '../model/steps';

/** Segmented progress across lesson steps. Wrong answers use destructive color. */
export function StepProgress({
  steps,
  index,
  maxReached,
  tones,
  onSelect,
  label = 'Шаги урока',
}: {
  steps: LessonStep[];
  index: number;
  maxReached: number;
  tones: StepTone[];
  onSelect: (stepIndex: number) => void;
  label?: string;
}) {
  return (
    <ol className="m-0 flex list-none gap-1 p-0" aria-label={label}>
      {steps.map((step, stepIndex) => {
        const reachable = stepIndex <= maxReached;
        const isCurrent = stepIndex === index;
        const visitedAhead = stepIndex > index && stepIndex <= maxReached;
        const behind = stepIndex < index;
        const tone = tones[stepIndex] ?? 'neutral';
        const isError = tone === 'error';

        return (
          <li key={step.id} className="min-w-0 flex-1">
            <button
              type="button"
              disabled={!reachable}
              aria-current={isCurrent ? 'step' : undefined}
              aria-invalid={isError ? true : undefined}
              aria-label={`Шаг ${stepIndex + 1} из ${steps.length}`}
              title={`Шаг ${stepIndex + 1}`}
              className={cn(
                'h-1 w-full rounded-full transition-colors',
                isCurrent && !isError && 'bg-success',
                isCurrent && isError && 'bg-destructive',
                behind && !isError && 'bg-success/70',
                behind && isError && 'bg-destructive/70',
                visitedAhead && !isError && 'bg-success/35',
                visitedAhead && isError && 'bg-destructive/35',
                !reachable && 'bg-muted',
                reachable && !isError && 'hover:bg-success',
                reachable && isError && 'hover:bg-destructive',
              )}
              onClick={() => onSelect(stepIndex)}
            />
          </li>
        );
      })}
    </ol>
  );
}
