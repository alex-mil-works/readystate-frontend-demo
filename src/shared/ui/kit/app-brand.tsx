import { APP_NAME, APP_TAGLINE, IS_DEMO_BUILD } from '@/shared/config';

import { Badge } from './badge';

type AppBrandSize = 'sm' | 'lg';

const SIZE_CLASS: Record<
  AppBrandSize,
  { name: string; divider: string; tagline: string; gap: string }
> = {
  sm: {
    gap: 'gap-1.5',
    name: 'text-sm font-semibold tracking-wide',
    divider: 'text-sm',
    tagline: 'text-xs',
  },
  lg: {
    gap: 'gap-2',
    name: 'text-2xl font-semibold tracking-tight',
    divider: 'text-xl',
    tagline: 'text-sm',
  },
};

/** Inline brand: `ReadyState | Знания, готовые к интервью` — name bold, slogan muted. */
export function AppBrand({
  size = 'sm',
  showDemoBadge = false,
  /** Hide `| slogan` below the `sm` breakpoint (header chrome). */
  collapseTaglineOnNarrow = false,
  className,
}: {
  size?: AppBrandSize;
  showDemoBadge?: boolean;
  collapseTaglineOnNarrow?: boolean;
  className?: string;
}) {
  const styles = SIZE_CLASS[size];
  const taglineVisibility = collapseTaglineOnNarrow ? 'hidden sm:inline' : '';

  return (
    <span
      className={`inline-flex max-w-full min-w-0 items-baseline ${styles.gap} ${className ?? ''}`}
    >
      <span className={`text-foreground shrink-0 ${styles.name}`}>{APP_NAME}</span>
      <span
        className={`text-muted-foreground/50 shrink-0 select-none ${styles.divider} ${taglineVisibility}`}
        aria-hidden
      >
        |
      </span>
      <span
        className={`text-muted-foreground/70 min-w-0 truncate ${styles.tagline} ${taglineVisibility}`}
      >
        {APP_TAGLINE}
      </span>
      {showDemoBadge && IS_DEMO_BUILD ? (
        <Badge
          variant="secondary"
          title="Публичная демо-сборка (S01)"
          className="shrink-0 self-center"
        >
          Demo
        </Badge>
      ) : null}
    </span>
  );
}

/** Brand as a heading (password gate). */
export function AppBrandHeading({ size = 'lg' }: { size?: AppBrandSize }) {
  return (
    <h1 className="m-0">
      <AppBrand size={size} />
    </h1>
  );
}
