import { type LessonWarmth, WARMTH_COLOR, WARMTH_LEGEND } from '@/shared/lib/progress';

function Dot({ id }: { id: LessonWarmth }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: WARMTH_COLOR[id] }}
      aria-hidden
    />
  );
}

/** Compact strip: how long since the learner last touched a topic. */
export function WarmthLegend({ className }: { className?: string }) {
  return (
    <aside
      className={`bg-card ring-foreground/5 inline-flex max-w-full flex-wrap items-baseline gap-x-3 gap-y-1.5 rounded-xl px-3 py-2 ring-1 ${className ?? ''}`}
      aria-label="Повторение"
    >
      <span className="text-muted-foreground shrink-0 text-xs font-medium">Повторение</span>
      <span className="text-border hidden sm:inline" aria-hidden>
        |
      </span>
      <ul className="m-0 flex min-w-0 list-none flex-wrap items-center gap-x-3 gap-y-1 p-0">
        {WARMTH_LEGEND.map((item) => (
          <li
            key={item.id}
            className="inline-flex max-w-full items-center gap-1.5 text-xs sm:text-sm"
          >
            <Dot id={item.id} />
            <span className="text-foreground">{item.phrase}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
