import type { ReactNode } from 'react';
import { Link } from 'react-router';

import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import LockIcon from '@hugeicons/core-free-icons/LockIcon';
import PlayIcon from '@hugeicons/core-free-icons/PlayIcon';
import Progress01Icon from '@hugeicons/core-free-icons/Progress01Icon';
import type { IconSvgElement } from '@hugeicons/react';

import {
  type CoursePreview,
  type LessonGroupPreview,
  type LessonProgress,
  type LessonProgressStatus,
  type StagePreview,
  type UnitItemPreview,
  resolveProgressStatus,
} from '@/shared/config';
import {
  type CourseProgressRecord,
  type LessonWarmth,
  WARMTH_COLOR,
  lessonActivityAt,
  overlayCourseProgress,
  resolveLessonWarmth,
  resolveStageWarmth,
} from '@/shared/lib/progress';
import { useProgressStore } from '@/shared/lib/store/progress-store';
import { type UnitItemsLayout, useUiPrefsStore } from '@/shared/lib/store/ui-prefs-store';
import { Icon } from '@/shared/ui/kit';

import { lessonPathForCourse } from '@/features/select-role-stack';

import { resolveDisplayStages } from './display-stages';

/** Hard cap matching unit.yaml maxLength(6). */
const MAX_GROUP_ITEMS = 6;
const RING_STROKE = 2.5;

const STATUS_ICON: Record<LessonProgressStatus, IconSvgElement> = {
  not_started: PlayIcon,
  in_progress: Progress01Icon,
  completed: CheckmarkCircle02Icon,
};

const STATUS_LABEL: Record<LessonProgressStatus, string> = {
  not_started: 'Не начато',
  in_progress: 'В процессе',
  completed: 'Пройдено',
};

/** Decorative warmth dot — no text tooltips. */
function WarmthIndicator({
  warmth,
  className,
}: {
  warmth: LessonWarmth | null;
  className?: string;
}) {
  if (!warmth) return null;
  return (
    <span
      className={`inline-block size-2 shrink-0 rounded-full ${className ?? ''}`}
      style={{ backgroundColor: WARMTH_COLOR[warmth] }}
      aria-hidden
    />
  );
}

function itemWarmth(
  item: UnitItemPreview,
  record: CourseProgressRecord | undefined,
  now: number,
): LessonWarmth | null {
  if (item.locked) return null;
  const status = resolveProgressStatus(item.progress);
  return resolveLessonWarmth(status, lessonActivityAt(record, item.id, status), now);
}

function itemGridClass(layout: UnitItemsLayout): string {
  if (layout === 'list') return 'grid grid-cols-1 gap-3';
  return 'grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3';
}

function progressLabel(progress: LessonProgress): string {
  return `${progress.completed}/${progress.total}`;
}

function progressRatio(progress: LessonProgress): number {
  if (progress.total <= 0) return 0;
  return Math.min(1, progress.completed / progress.total);
}

function ringStrokeColor(status: LessonProgressStatus, locked?: boolean): string {
  if (locked) return 'var(--rs-border)';
  switch (status) {
    case 'completed':
      return 'var(--rs-success)';
    case 'in_progress':
      return 'var(--rs-accent)';
    default:
      return 'var(--rs-border)';
  }
}

function statusInnerClass(status: LessonProgressStatus, locked?: boolean): string {
  if (locked) return 'bg-muted/60 text-muted-foreground';
  if (status === 'completed') return 'bg-success/10 text-success';
  if (status === 'in_progress') return 'bg-accent/10 text-accent';
  return 'bg-muted/40 text-muted-foreground';
}

function ProgressRing({
  size,
  progress,
  status,
  locked,
  children,
}: {
  size: number;
  progress: LessonProgress;
  status: LessonProgressStatus;
  locked?: boolean;
  children: ReactNode;
}) {
  const r = (size - RING_STROKE) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = locked ? 0 : progressRatio(progress);
  const dashOffset = circumference * (1 - ratio);
  const strokeColor = ringStrokeColor(status, locked);

  return (
    <div
      className={`relative shrink-0 overflow-visible ${locked ? 'opacity-55' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90 overflow-visible"
        width={size}
        height={size}
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--rs-border)"
          strokeWidth={RING_STROKE}
          opacity={0.4}
        />
        {ratio > 0 ? (
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

function MiniProgressBar({
  progress,
  status,
  locked,
}: {
  progress: LessonProgress;
  status: LessonProgressStatus;
  locked?: boolean;
}) {
  const ratio = locked ? 0 : progressRatio(progress);
  const fill = ringStrokeColor(status, locked);

  return (
    <div
      className="bg-muted h-1 min-w-0 flex-1 overflow-hidden rounded-full"
      role="progressbar"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${ratio * 100}%`, backgroundColor: fill }}
      />
    </div>
  );
}

function StatusCircle({
  progress,
  status,
  size = 'md',
  locked,
}: {
  progress: LessonProgress;
  status: LessonProgressStatus;
  size?: 'md' | 'sm';
  locked?: boolean;
}) {
  const outer = size === 'sm' ? 44 : 64;
  const inner = size === 'sm' ? 34 : 50;
  const iconSize = size === 'sm' ? 16 : 22;
  const icon = locked ? LockIcon : STATUS_ICON[status];

  return (
    <ProgressRing size={outer} progress={progress} status={status} locked={locked}>
      <div
        className={`${statusInnerClass(status, locked)} flex items-center justify-center rounded-full`}
        style={{ width: inner, height: inner }}
      >
        <Icon icon={icon} size={iconSize} />
      </div>
    </ProgressRing>
  );
}

function UnitItemCard({
  item,
  layout,
  course,
  progressRecord,
  now,
}: {
  item: UnitItemPreview;
  layout: UnitItemsLayout;
  course: CoursePreview;
  progressRecord: CourseProgressRecord | undefined;
  now: number;
}) {
  const locked = item.locked === true;
  const playable = item.playable === true && !locked;
  const status = locked ? 'not_started' : resolveProgressStatus(item.progress);
  const warmth = itemWarmth(item, progressRecord, now);
  const label = `${item.title} · ${progressLabel(item.progress)} · ${locked ? 'Заблокировано' : STATUS_LABEL[status]}`;
  const lessonPath = lessonPathForCourse(course, item.id);

  const body =
    layout === 'list' ? (
      <>
        <StatusCircle progress={item.progress} status={status} size="sm" locked={locked} />
        <div className="min-w-0 flex-1">
          <div className="text-foreground text-sm leading-snug font-medium text-pretty">
            {item.title}
            <WarmthIndicator warmth={warmth} className="ml-2 inline-block align-middle" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {progressLabel(item.progress)}
            </span>
            <MiniProgressBar progress={item.progress} status={status} locked={locked} />
          </div>
        </div>
      </>
    ) : (
      <>
        <StatusCircle progress={item.progress} status={status} locked={locked} />
        <div className="text-foreground w-full text-center text-sm leading-snug font-medium text-pretty">
          {item.title}
          <WarmthIndicator warmth={warmth} className="ml-2 inline-block align-middle" />
        </div>
        <div className="text-muted-foreground text-xs tabular-nums">
          {progressLabel(item.progress)}
        </div>
      </>
    );

  const layoutClass =
    layout === 'list'
      ? 'hover:bg-muted/30 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors'
      : 'flex min-w-0 flex-col items-center gap-2 text-center';

  if (playable) {
    return (
      <Link to={lessonPath} className={`${layoutClass} no-underline`} title={label}>
        {body}
      </Link>
    );
  }

  return (
    <div className={layoutClass} aria-disabled="true" title={label}>
      {body}
    </div>
  );
}

/** Silent visual group — spacing only, no unit title in UI. */
function LessonGroupBlock({
  group,
  layout,
  course,
  progressRecord,
  now,
}: {
  group: LessonGroupPreview;
  layout: UnitItemsLayout;
  course: CoursePreview;
  progressRecord: CourseProgressRecord | undefined;
  now: number;
}) {
  const items = group.items.slice(0, MAX_GROUP_ITEMS);
  if (items.length === 0) return null;

  return (
    <div className={itemGridClass(layout)}>
      {items.map((item) => (
        <UnitItemCard
          key={item.id}
          item={item}
          layout={layout}
          course={course}
          progressRecord={progressRecord}
          now={now}
        />
      ))}
    </div>
  );
}

function stageProgress(stage: StagePreview): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const group of stage.groups) {
    for (const item of group.items) {
      if (item.locked) continue;
      total += 1;
      if (resolveProgressStatus(item.progress) === 'completed') done += 1;
    }
  }
  return { done, total };
}

function stageWarmth(
  stage: StagePreview,
  record: CourseProgressRecord | undefined,
  now: number,
): LessonWarmth | null {
  const values: Array<LessonWarmth | null> = [];
  for (const group of stage.groups) {
    for (const item of group.items) {
      values.push(itemWarmth(item, record, now));
    }
  }
  return resolveStageWarmth(values);
}

function StageBlock({
  stage,
  layout,
  course,
  progressRecord,
  now,
}: {
  stage: StagePreview;
  layout: UnitItemsLayout;
  course: CoursePreview;
  progressRecord: CourseProgressRecord | undefined;
  now: number;
}) {
  const empty = stage.empty === true;
  const { done, total } = stageProgress(stage);
  const warmth = empty ? null : stageWarmth(stage, progressRecord, now);
  const stageKey = `${course.id}:${stage.id}`;
  const expandedOverride = useUiPrefsStore((s) => s.stageExpanded[stageKey]);
  const setStageExpanded = useUiPrefsStore((s) => s.setStageExpanded);
  const expanded = expandedOverride ?? !empty;

  return (
    <li className={empty ? 'opacity-50' : undefined}>
      <section
        className={
          empty
            ? 'border-border/60 rounded-2xl border border-dashed px-3 py-3 sm:px-4'
            : 'bg-card ring-foreground/5 rounded-2xl px-3 py-3 ring-1 sm:px-4'
        }
        aria-disabled={empty || undefined}
      >
        <button
          type="button"
          className="hover:bg-muted/40 flex w-full items-start gap-3 rounded-xl px-1 py-1 text-left transition-colors"
          aria-expanded={expanded}
          onClick={() => setStageExpanded(stageKey, !expanded)}
        >
          <Icon
            icon={ArrowDown01Icon}
            size={18}
            className={`text-muted-foreground mt-1 shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2
              className={`m-0 text-lg font-medium tracking-tight ${empty ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {stage.title}
              <WarmthIndicator warmth={warmth} className="ml-1.5 inline-block align-middle" />
            </h2>
            {stage.titleEn !== stage.title ? (
              <p className="text-muted-foreground m-0 text-sm">{stage.titleEn}</p>
            ) : null}
            {empty ? (
              <p className="text-muted-foreground m-0 text-sm">Скоро</p>
            ) : (
              <p className="text-muted-foreground m-0 text-sm tabular-nums">
                {done}/{total}
              </p>
            )}
            <span className="sr-only">{expanded ? 'Свернуть этап' : 'Развернуть этап'}</span>
          </div>
        </button>

        {expanded && !empty ? (
          <div className="mt-6">
            {stage.groups.map((group, index) => (
              <div key={group.groupId}>
                {index > 0 ? (
                  <div className="border-border/60 my-8 border-t" role="separator" aria-hidden />
                ) : null}
                <LessonGroupBlock
                  group={group}
                  layout={layout}
                  course={course}
                  progressRecord={progressRecord}
                  now={now}
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </li>
  );
}

/** Stages and lesson tiles for the selected role/stack. Units are silent visual groups. */
export function CourseMap({ course }: { course: CoursePreview }) {
  const unitItemsLayout = useUiPrefsStore((s) => s.unitItemsLayout);
  const progressRecord = useProgressStore((s) => s.byCourseId[course.id]);
  const mapped = overlayCourseProgress(course, progressRecord);
  const now = Date.now();
  const displayStages = resolveDisplayStages(mapped);

  if (displayStages.length === 0) {
    return (
      <p className="text-destructive m-0 text-sm leading-relaxed" role="alert">
        Курс не загружен. Скомпилируйте контент (`yarn content:compile`) и обновите страницу.
      </p>
    );
  }

  return (
    <ul className="m-0 list-none space-y-10 p-0">
      {displayStages.map((stage) => (
        <StageBlock
          key={stage.id}
          stage={stage}
          layout={unitItemsLayout}
          course={mapped}
          progressRecord={progressRecord}
          now={now}
        />
      ))}
    </ul>
  );
}
