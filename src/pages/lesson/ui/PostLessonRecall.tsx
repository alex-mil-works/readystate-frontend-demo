import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';

import type { PoolActivity } from '@/shared/lib/content';
import { Button, Icon } from '@/shared/ui/kit';

import { ActivityStep } from './ActivityStep';

/** Post-lesson bonus: answer up to 2 unit-pool Recall cards. */
export function PostLessonRecall({
  cards,
  index,
  selectedId,
  onSelect,
  onBack,
  onNext,
  onSkip,
}: {
  cards: PoolActivity[];
  index: number;
  selectedId?: string;
  onSelect: (optionId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const card = cards[index];
  if (!card) return null;

  const answered = card.kind === 'interview_phrasing' ? true : selectedId !== undefined;
  const isLast = index >= cards.length - 1;
  const nextLabel = isLast ? 'Готово' : 'Далее';

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground m-0 text-sm">
          +{cards.length} Recall · {index + 1}/{cards.length}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
          Пропустить
        </Button>
      </div>

      <section className="bg-card ring-foreground/10 rounded-2xl p-5 ring-1 sm:p-6">
        <ActivityStep
          activity={card}
          selectedId={selectedId}
          phrasingDraft=""
          sampleOpen={false}
          onSelect={onSelect}
          onPhrasingDraft={() => undefined}
          onRevealSample={() => undefined}
        />
      </section>

      <div className="bg-background sticky bottom-0 mt-4 flex items-center justify-between gap-3 py-2">
        <Button
          type="button"
          variant="ghost"
          disabled={index <= 0}
          aria-label="Назад"
          onClick={onBack}
        >
          <Icon icon={ArrowLeft01Icon} size={16} />
          Назад
        </Button>
        <Button type="button" disabled={!answered} aria-label={nextLabel} onClick={onNext}>
          {nextLabel}
          <Icon icon={ArrowRight01Icon} size={16} />
        </Button>
      </div>
    </div>
  );
}
