import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';

import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';

import { getCourseByRoleStack } from '@/shared/config';
import { getCourseReviewPoolByRoleStack } from '@/shared/content/generated';
import type { PoolActivity } from '@/shared/lib/content';
import { pickReviewSession, poolActivityKeys } from '@/shared/lib/engine';
import { courseCompositeId } from '@/shared/lib/progress';
import { useProgressStore } from '@/shared/lib/store/progress-store';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { Button, Icon } from '@/shared/ui/kit';

import { homePathForRoleStack } from '@/features/select-role-stack';

import {
  ActivitySessionShell,
  choiceOptionIds,
  useSessionKeyboard,
} from '@/widgets/activity-session';

import { type LessonStep, activityAnswerTone } from '@/pages/lesson/model/steps';
import { ActivityStep } from '@/pages/lesson/ui/ActivityStep';
import { StepProgress } from '@/pages/lesson/ui/StepProgress';
import { TheoryHintsButton } from '@/pages/lesson/ui/TheoryHintsButton';
import { getActivityTheoryHints } from '@/pages/lesson/ui/get-activity-theory-hints';

function isChoiceComplete(card: PoolActivity, answers: Record<string, string>): boolean {
  if (card.kind === 'interview_phrasing') return true;
  return answers[card.id] !== undefined;
}

/** Full-screen review session: capped pack of due Recall/Speak cards (lesson-like UI). */
export function ReviewPage() {
  const navigate = useNavigate();
  const { roleId: rawRole, stackId: rawStack } = useParams();
  const roleId = rawRole ? decodeURIComponent(rawRole) : undefined;
  const stackId = rawStack ? decodeURIComponent(rawStack) : undefined;

  const coursePath =
    roleId && stackId ? homePathForRoleStack(roleId, stackId) : homePathForRoleStack();
  const courseId = roleId && stackId ? courseCompositeId(roleId, stackId) : '';
  const courseTitle =
    roleId && stackId ? (getCourseByRoleStack(roleId, stackId)?.title ?? courseId) : '';

  const markRecallShown = useProgressStore((s) => s.markRecallShown);
  const hydrated = useProgressStore((s) => s.hydrated);

  const [cards, setCards] = useState<PoolActivity[] | null>(null);
  const [index, setIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phrasingDrafts, setPhrasingDrafts] = useState<Record<string, string>>({});
  const [sampleOpen, setSampleOpen] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const markedKeysRef = useRef(new Set<string>());
  const scrollerRef = useRef<HTMLElement>(null);

  useDocumentTitle('Повторение');

  const exitToCourse = useCallback(() => {
    void navigate(coursePath, { replace: false });
  }, [coursePath, navigate]);

  useEffect(() => {
    if (!hydrated || !roleId || !stackId || !courseId) return;
    const pool = getCourseReviewPoolByRoleStack(roleId, stackId);
    const session = pickReviewSession({
      pool,
      scheduleByKey: useProgressStore.getState().byCourseId[courseId]?.recallItems ?? {},
    });
    setCards(session);
    setIndex(0);
    setMaxReached(0);
    setAnswers({});
    setPhrasingDrafts({});
    setSampleOpen({});
    setFinished(false);
    markedKeysRef.current = new Set();
    // Pick once when workspace is ready — do not reset mid-session when due updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount/workspace pick
  }, [hydrated, roleId, stackId, courseId]);

  const current = cards?.[index];
  const steps: LessonStep[] = useMemo(
    () => (cards ?? []).map((card) => ({ kind: 'activity' as const, id: card.id, activity: card })),
    [cards],
  );
  const tones = useMemo(
    () => (cards ?? []).map((card) => activityAnswerTone(card, answers[card.id])),
    [cards, answers],
  );

  const markCurrentShown = useCallback(() => {
    if (!courseId || !roleId || !stackId || !current) return;
    const key = poolActivityKeys([current])[0];
    if (!key || markedKeysRef.current.has(key)) return;
    markedKeysRef.current.add(key);
    markRecallShown(courseId, [key], {
      roleId,
      stackId,
      title: courseTitle,
    });
  }, [courseId, courseTitle, current, markRecallShown, roleId, stackId]);

  useEffect(() => {
    if (finished || !current) return;
    markCurrentShown();
  }, [current, finished, markCurrentShown]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [index, finished]);

  const canGoBack = index > 0 || finished;
  const canGoNext = current ? index < maxReached || isChoiceComplete(current, answers) : false;

  const goBack = useCallback(() => {
    if (finished) {
      setFinished(false);
      return;
    }
    setIndex((value) => Math.max(0, value - 1));
  }, [finished]);

  const goNext = useCallback(() => {
    if (!cards || !current) return;
    if (!isChoiceComplete(current, answers) && index >= maxReached) return;
    if (index >= cards.length - 1) {
      setFinished(true);
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setMaxReached((value) => Math.max(value, nextIndex));
  }, [answers, cards, current, index, maxReached]);

  const selectAnswer = useCallback(
    (optionId: string) => {
      if (!current || answers[current.id] !== undefined) return;
      setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: optionId }));
    },
    [answers, current],
  );

  const optionIds = useMemo(
    () => (finished || !current ? [] : choiceOptionIds(current)),
    [current, finished],
  );

  useSessionKeyboard({
    onBack: goBack,
    onNext: goNext,
    optionIds,
    onChooseOption: selectAnswer,
    enabled: cards !== null && cards.length > 0,
  });

  if (!roleId || !stackId) {
    return <Navigate to={homePathForRoleStack()} replace />;
  }

  if (!hydrated || cards === null) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center px-4">
        <p className="text-muted-foreground m-0 text-sm">Загрузка…</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return <Navigate to={coursePath} replace />;
  }

  const nextLabel = index >= cards.length - 1 ? 'Готово' : 'Далее';
  const theoryHints = current ? getActivityTheoryHints(current) : null;
  const theoryCenter = theoryHints ? <TheoryHintsButton hints={theoryHints} /> : null;

  return (
    <ActivitySessionShell
      title="Повторение"
      exitAriaLabel="Закрыть"
      onExit={exitToCourse}
      canGoBack={canGoBack}
      onBack={goBack}
      scrollerRef={scrollerRef}
      progress={
        <StepProgress
          steps={steps}
          index={finished ? steps.length - 1 : index}
          maxReached={finished ? steps.length - 1 : maxReached}
          tones={tones}
          label="Повторение"
          onSelect={(stepIndex) => {
            if (stepIndex <= maxReached) {
              setFinished(false);
              setIndex(stepIndex);
            }
          }}
        />
      }
      footer={
        finished || !current
          ? null
          : {
              canGoBack,
              canGoNext,
              nextLabel,
              onBack: goBack,
              onNext: goNext,
              center: theoryCenter,
            }
      }
    >
      {finished ? (
        <section className="bg-card ring-foreground/10 rounded-2xl p-6 ring-1">
          <div className="text-success mb-3">
            <Icon icon={CheckmarkCircle02Icon} size={36} />
          </div>
          <h1 className="text-foreground m-0 text-2xl font-medium tracking-tight">
            Повторение завершено
          </h1>
          <p className="text-muted-foreground mt-4 mb-0 text-sm">
            {cards.length} карточек · следующее повторение по расписанию
          </p>
          <div className="mt-8">
            <Button type="button" onClick={exitToCourse}>
              К курсу
            </Button>
          </div>
        </section>
      ) : current ? (
        <section className="bg-card ring-foreground/10 rounded-2xl p-5 ring-1 sm:p-6">
          <ActivityStep
            activity={current}
            selectedId={answers[current.id]}
            phrasingDraft={phrasingDrafts[current.id] ?? ''}
            sampleOpen={sampleOpen[current.id] === true}
            onSelect={selectAnswer}
            onPhrasingDraft={(value) =>
              setPhrasingDrafts((drafts) => ({ ...drafts, [current.id]: value }))
            }
            onRevealSample={() => setSampleOpen((open) => ({ ...open, [current.id]: true }))}
          />
        </section>
      ) : null}
    </ActivitySessionShell>
  );
}
