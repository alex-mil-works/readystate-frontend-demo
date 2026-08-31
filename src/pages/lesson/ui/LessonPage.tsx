import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';

import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';

import { getCourseByRoleStack } from '@/shared/config';
import {
  getCompiledLessonByRoleStack,
  getLessonPoolContextByRoleStack,
} from '@/shared/content/generated';
import type { PoolActivity } from '@/shared/lib/content';
import { pickRecall, poolActivityKeys } from '@/shared/lib/engine';
import { courseCompositeId } from '@/shared/lib/progress';
import { useProgressStore } from '@/shared/lib/store/progress-store';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { Button, Icon } from '@/shared/ui/kit';

import { homePathForRoleStack, legacyLessonIdRedirect } from '@/features/select-role-stack';

import { type LessonStep, activityAnswerTone, lessonToSteps, stepAnswerTone } from '../model/steps';
import { ActivityStep } from './ActivityStep';
import { InsightStep } from './InsightStep';
import { PostLessonRecall } from './PostLessonRecall';
import { StepProgress } from './StepProgress';

const POST_LESSON_RECALL_COUNT = 2;

function isChoiceComplete(step: LessonStep, answers: Record<string, string>): boolean {
  if (step.kind === 'insight') return true;
  if (step.activity.kind === 'interview_phrasing') return true;
  return answers[step.id] !== undefined;
}

const EMPTY_RECALL_KEYS: string[] = [];

/** Full-screen lesson player: one step card at a time. */
export function LessonPage() {
  const { roleId, stackId, lessonId } = useParams();

  const redirectTo = useMemo(() => {
    if (roleId && stackId && lessonId) {
      return legacyLessonIdRedirect(roleId, stackId, lessonId);
    }
    return undefined;
  }, [roleId, stackId, lessonId]);

  const lesson = useMemo(() => {
    if (redirectTo || !lessonId || !roleId || !stackId) return undefined;
    return getCompiledLessonByRoleStack(roleId, stackId, lessonId);
  }, [redirectTo, roleId, stackId, lessonId]);

  const steps = useMemo(() => (lesson ? lessonToSteps(lesson) : []), [lesson]);

  const coursePath =
    roleId && stackId ? homePathForRoleStack(roleId, stackId) : homePathForRoleStack();

  const [index, setIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phrasingDrafts, setPhrasingDrafts] = useState<Record<string, string>>({});
  const [sampleOpen, setSampleOpen] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [bonusCards, setBonusCards] = useState<PoolActivity[] | null>(null);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [bonusMaxReached, setBonusMaxReached] = useState(0);
  const [bonusAnswers, setBonusAnswers] = useState<Record<string, string>>({});
  const scrollerRef = useRef<HTMLElement>(null);
  const markLessonStarted = useProgressStore((state) => state.markLessonStarted);
  const markLessonCompleted = useProgressStore((state) => state.markLessonCompleted);
  const markRecallShown = useProgressStore((state) => state.markRecallShown);
  const shownRecallKeys = useProgressStore((state) => {
    const resolved = roleId && stackId ? courseCompositeId(roleId, stackId) : '';
    return state.byCourseId[resolved]?.shownRecallKeys ?? EMPTY_RECALL_KEYS;
  });

  useDocumentTitle(lesson?.title);

  const resolvedCourseId = useMemo(() => {
    if (roleId && stackId) return courseCompositeId(roleId, stackId);
    return '';
  }, [roleId, stackId]);

  const poolContext = useMemo(() => {
    if (!lessonId || !roleId || !stackId) return undefined;
    return getLessonPoolContextByRoleStack(roleId, stackId, lessonId);
  }, [roleId, stackId, lessonId]);

  const availableBonus = useMemo(() => {
    if (!poolContext || !lessonId) return [];
    return pickRecall({
      n: POST_LESSON_RECALL_COUNT,
      scope: 'unit',
      pool: poolContext.unitPool,
      lessonId,
      recentlyShown: shownRecallKeys,
    });
  }, [poolContext, lessonId, shownRecallKeys]);

  // Reset player state when switching lessons
  useEffect(() => {
    setIndex(0);
    setMaxReached(0);
    setAnswers({});
    setPhrasingDrafts({});
    setSampleOpen({});
    setFinished(false);
    setBonusCards(null);
    setBonusIndex(0);
    setBonusMaxReached(0);
    setBonusAnswers({});
  }, [roleId, stackId, lessonId]);

  useEffect(() => {
    if (!lesson || !lessonId || !resolvedCourseId) return;
    const preview = roleId && stackId ? getCourseByRoleStack(roleId, stackId) : undefined;
    markLessonStarted({
      courseId: resolvedCourseId,
      roleId: preview?.roleId ?? roleId ?? '',
      stackId: preview?.stackId ?? stackId ?? '',
      title: preview?.title ?? lesson.title,
      lessonId,
    });
  }, [lesson, lessonId, markLessonStarted, resolvedCourseId, roleId, stackId]);

  const goTo = useCallback((nextIndex: number) => {
    setIndex(nextIndex);
    setMaxReached((reached) => Math.max(reached, nextIndex));
  }, []);

  const current = steps[index];
  const inBonus = bonusCards !== null && bonusCards.length > 0;
  const canGoBack = inBonus ? bonusIndex > 0 : finished || index > 0;
  const canGoNext = current ? index < maxReached || isChoiceComplete(current, answers) : false;

  const goBack = useCallback(() => {
    if (bonusCards) {
      if (bonusIndex > 0) setBonusIndex((idx) => idx - 1);
      return;
    }
    if (finished) {
      setFinished(false);
      return;
    }
    if (index <= 0) return;
    setIndex((currentIndex) => currentIndex - 1);
  }, [bonusCards, bonusIndex, finished, index]);

  const startBonusRecall = useCallback(() => {
    if (availableBonus.length === 0) return;
    setBonusCards(availableBonus);
    setBonusIndex(0);
    setBonusMaxReached(0);
    setBonusAnswers({});
    markRecallShown(resolvedCourseId, poolActivityKeys(availableBonus));
  }, [availableBonus, markRecallShown, resolvedCourseId]);

  const finishBonusRecall = useCallback(() => {
    setBonusCards(null);
    setBonusIndex(0);
    setBonusMaxReached(0);
    setBonusAnswers({});
  }, []);

  const goNextBonus = useCallback(() => {
    if (!bonusCards) return;
    if (bonusIndex >= bonusCards.length - 1) {
      finishBonusRecall();
      return;
    }
    setBonusIndex((idx) => idx + 1);
    setBonusMaxReached((reached) => Math.max(reached, bonusIndex + 1));
  }, [bonusCards, bonusIndex, finishBonusRecall]);

  const goNext = useCallback(() => {
    if (!current || !canGoNext) return;
    if (index >= steps.length - 1) {
      setFinished(true);
      if (lessonId && resolvedCourseId) {
        const preview = roleId && stackId ? getCourseByRoleStack(roleId, stackId) : undefined;
        markLessonCompleted({
          courseId: resolvedCourseId,
          roleId: preview?.roleId ?? roleId ?? '',
          stackId: preview?.stackId ?? stackId ?? '',
          title: preview?.title ?? lesson?.title ?? resolvedCourseId,
          lessonId,
        });
      }
      return;
    }
    goTo(index + 1);
  }, [
    canGoNext,
    current,
    goTo,
    index,
    lesson,
    lessonId,
    markLessonCompleted,
    resolvedCourseId,
    roleId,
    stackId,
    steps.length,
  ]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [index, finished, bonusIndex, bonusCards]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)
      ) {
        return;
      }
      if (bonusCards) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goBack();
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNextBonus();
        }
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [bonusCards, goBack, goNext, goNextBonus]);

  if (redirectTo) return <Navigate to={redirectTo} replace />;

  const hasCourseContext = Boolean(roleId && stackId);

  if (!lesson || !lessonId || !hasCourseContext) {
    return (
      <div className="flex min-h-svh flex-col">
        <header className="border-border w-full border-b">
          <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="К курсу"
              nativeButton={false}
              render={<Link to={coursePath} />}
            >
              <Icon icon={ArrowLeft01Icon} size={18} />
            </Button>
            <div className="text-foreground text-sm font-medium">Урок</div>
            <span className="size-8" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl px-4 py-8">
          <h1 className="m-0 text-2xl font-medium tracking-tight">Урок пока недоступен</h1>
          <p className="text-muted-foreground mt-3 mb-0 text-sm leading-relaxed">
            Этот урок ещё не подключён к демо-плееру.
          </p>
          <p className="mt-6 mb-0 text-sm">
            <Link to={coursePath} className="text-foreground underline-offset-4 hover:underline">
              Вернуться к курсу
            </Link>
          </p>
        </main>
      </div>
    );
  }

  const nextLabel = index >= steps.length - 1 ? 'Завершить' : 'Далее';
  const stepTones = steps.map((step) => stepAnswerTone(step, answers));
  const bonusSteps: LessonStep[] = (bonusCards ?? []).map((card) => ({
    kind: 'activity',
    id: card.id,
    activity: card,
  }));
  const bonusTones = (bonusCards ?? []).map((card) =>
    activityAnswerTone(card, bonusAnswers[card.id]),
  );

  if (!finished && !current) {
    return null;
  }

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
            onClick={goBack}
          >
            <Icon icon={ArrowLeft01Icon} size={18} />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <div className="text-foreground truncate text-sm font-medium">
              {inBonus ? 'Ещё Recall' : lesson.title}
            </div>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Закрыть урок"
            nativeButton={false}
            render={<Link to={coursePath} />}
          >
            <Icon icon={Cancel01Icon} size={18} />
          </Button>
        </div>
        <div className="mx-auto w-full max-w-xl px-4 pb-3">
          {inBonus && bonusCards ? (
            <StepProgress
              steps={bonusSteps}
              index={bonusIndex}
              maxReached={bonusMaxReached}
              tones={bonusTones}
              label="Bonus Recall"
              onSelect={(stepIndex) => {
                if (stepIndex <= bonusMaxReached) setBonusIndex(stepIndex);
              }}
            />
          ) : (
            <StepProgress
              steps={steps}
              index={finished ? steps.length - 1 : index}
              maxReached={finished ? steps.length - 1 : maxReached}
              tones={stepTones}
              onSelect={(stepIndex) => {
                if (stepIndex <= maxReached) {
                  setFinished(false);
                  setIndex(stepIndex);
                }
              }}
            />
          )}
        </div>
      </header>

      <main ref={scrollerRef} className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-4 sm:py-6">
          {inBonus && bonusCards ? (
            <PostLessonRecall
              cards={bonusCards}
              index={bonusIndex}
              selectedId={bonusAnswers[bonusCards[bonusIndex]?.id ?? '']}
              onSelect={(optionId) => {
                const id = bonusCards[bonusIndex]?.id;
                if (!id) return;
                setBonusAnswers((currentAnswers) => ({ ...currentAnswers, [id]: optionId }));
              }}
              onBack={goBack}
              onNext={goNextBonus}
              onSkip={finishBonusRecall}
            />
          ) : finished ? (
            <section className="bg-card ring-foreground/10 flex flex-1 flex-col rounded-2xl p-6 ring-1">
              <div className="text-success mb-3">
                <Icon icon={CheckmarkCircle02Icon} size={36} />
              </div>
              <h1 className="text-foreground m-0 text-2xl font-medium tracking-tight">
                Урок пройден
              </h1>
              <p className="text-foreground/90 mt-3 mb-0 text-sm leading-relaxed">
                {lesson.essence}
              </p>
              <p className="text-muted-foreground mt-4 mb-0 text-sm">
                {steps.length} шагов · прогресс сохранён на этом устройстве
              </p>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {availableBonus.length > 0 ? (
                  <Button type="button" onClick={startBonusRecall}>
                    Ещё {availableBonus.length} Recall
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={availableBonus.length > 0 ? 'outline' : 'default'}
                  nativeButton={false}
                  render={<Link to={coursePath} />}
                >
                  К курсу
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFinished(false);
                    setIndex(0);
                    setMaxReached(0);
                    setAnswers({});
                    setPhrasingDrafts({});
                    setSampleOpen({});
                    setBonusCards(null);
                    setBonusIndex(0);
                    setBonusMaxReached(0);
                    setBonusAnswers({});
                  }}
                >
                  Пройти ещё раз
                </Button>
              </div>
            </section>
          ) : (
            <>
              <section className="bg-card ring-foreground/10 rounded-2xl p-5 ring-1 sm:p-6">
                {current.kind === 'insight' ? (
                  <InsightStep step={current} />
                ) : (
                  <ActivityStep
                    activity={current.activity}
                    selectedId={answers[current.id]}
                    phrasingDraft={phrasingDrafts[current.id] ?? ''}
                    sampleOpen={sampleOpen[current.id] === true}
                    onSelect={(optionId) =>
                      setAnswers((currentAnswers) => ({
                        ...currentAnswers,
                        [current.id]: optionId,
                      }))
                    }
                    onPhrasingDraft={(value) =>
                      setPhrasingDrafts((drafts) => ({ ...drafts, [current.id]: value }))
                    }
                    onRevealSample={() =>
                      setSampleOpen((open) => ({ ...open, [current.id]: true }))
                    }
                  />
                )}
              </section>

              <div className="bg-background sticky bottom-0 mt-4 flex items-center justify-between gap-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!canGoBack}
                  aria-label="Назад"
                  onClick={goBack}
                >
                  <Icon icon={ArrowLeft01Icon} size={16} />
                  Назад
                </Button>
                <Button type="button" disabled={!canGoNext} aria-label={nextLabel} onClick={goNext}>
                  {nextLabel}
                  <Icon icon={ArrowRight01Icon} size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
