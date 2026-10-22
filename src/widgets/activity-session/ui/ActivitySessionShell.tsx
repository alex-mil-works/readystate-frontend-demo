import type { ReactNode, Ref } from 'react';

import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';

import { Button, Icon } from '@/shared/ui/kit';

import { SessionKeyboardHints } from './SessionKeyboardHints';

export type ActivitySessionFooter = {
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  /** Optional control between Назад and Далее (e.g. theory «Подсказка»). */
  center?: ReactNode;
};

/** Shared full-screen chrome for lesson and review sessions. */
export function ActivitySessionShell({
  title,
  exitAriaLabel,
  onExit,
  canGoBack,
  onBack,
  progress,
  footer,
  showKeyboardHints = true,
  scrollerRef,
  children,
}: {
  title: string;
  exitAriaLabel: string;
  onExit: () => void;
  canGoBack: boolean;
  onBack: () => void;
  progress: ReactNode;
  footer?: ActivitySessionFooter | null;
  /** Keyboard cheat-sheet under Назад/Далее (reveal on demand; mouse dismisses). */
  showKeyboardHints?: boolean;
  scrollerRef?: Ref<HTMLElement>;
  children: ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <header className="border-border bg-background/90 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 px-3 py-2.5 sm:px-4">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Предыдущий шаг"
            disabled={!canGoBack}
            onClick={onBack}
          >
            <Icon icon={ArrowLeft01Icon} size={18} />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <div className="text-foreground truncate text-sm font-medium">{title}</div>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={exitAriaLabel}
            onClick={onExit}
          >
            <Icon icon={Cancel01Icon} size={18} />
          </Button>
        </div>
        <div className="mx-auto w-full max-w-xl px-4 pb-3">{progress}</div>
      </header>

      <main ref={scrollerRef} className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-4 sm:py-6">
          {children}
          {footer ? (
            <div className="bg-background sticky bottom-0 mt-5 pt-1 pb-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!footer.canGoBack}
                  aria-label="Назад"
                  onClick={footer.onBack}
                >
                  <Icon icon={ArrowLeft01Icon} size={16} />
                  Назад
                </Button>
                <div className="flex min-w-0 flex-1 justify-center">{footer.center ?? null}</div>
                <Button
                  type="button"
                  disabled={!footer.canGoNext}
                  aria-label={footer.nextLabel}
                  onClick={footer.onNext}
                >
                  {footer.nextLabel}
                  <Icon icon={ArrowRight01Icon} size={16} />
                </Button>
              </div>
              {showKeyboardHints ? <SessionKeyboardHints /> : null}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
