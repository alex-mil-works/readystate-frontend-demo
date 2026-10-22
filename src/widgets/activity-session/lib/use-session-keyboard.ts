import { useEffect } from 'react';

import type { Activity } from '@/shared/lib/content';

/** Option ids in display order for digit shortcuts (1–9). */
export function choiceOptionIds(activity: Activity | undefined): string[] {
  if (!activity) return [];
  if (activity.kind === 'interview_phrasing') return [];
  if (activity.kind === 'single_choice') return activity.options.map((option) => option.id);
  return activity.choices.map((option) => option.id);
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)
  );
}

/** Arrow keys + optional digit choice selection for session players. */
export function useSessionKeyboard({
  onBack,
  onNext,
  optionIds = [],
  onChooseOption,
  enabled = true,
}: {
  onBack: () => void;
  onNext: () => void;
  optionIds?: string[];
  onChooseOption?: (optionId: string) => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onBack();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
        return;
      }

      if (!onChooseOption || optionIds.length === 0) return;
      const match = /^[1-9]$/.exec(event.key);
      if (!match) return;
      const optionId = optionIds[Number(match[0]) - 1];
      if (!optionId) return;
      event.preventDefault();
      onChooseOption(optionId);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onBack, onChooseOption, onNext, optionIds]);
}
