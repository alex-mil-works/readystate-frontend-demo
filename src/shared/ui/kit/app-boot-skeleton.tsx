/** Calm boot placeholder shaped like onboarding (AppBrandHeading lg + RoleStack capsules + CTA). */
export function AppBootSkeleton() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center px-4 py-12"
      aria-busy="true"
      aria-label="Загрузка"
    >
      <div className="w-full max-w-lg">
        {/* Mirrors AppBrand size=lg: text-2xl name | text-sm tagline */}
        <div className="flex items-baseline gap-2">
          <div className="bg-muted h-6 w-[9.5rem] animate-pulse rounded-md" />
          <div className="bg-muted/40 h-4 w-1.5 shrink-0 animate-pulse rounded-sm" aria-hidden />
          <div className="bg-muted/55 h-3.5 w-[14rem] max-w-[55%] animate-pulse rounded-full" />
        </div>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
          <div className="border-border bg-card/80 inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-full border p-1">
            <span className="px-2">
              <span className="bg-muted/70 block h-3 w-7 animate-pulse rounded-full" />
            </span>
            <div className="bg-muted h-8 w-[5.5rem] animate-pulse rounded-full" />
            <div className="bg-muted h-8 w-[7.75rem] animate-pulse rounded-full" />
          </div>
          <div className="border-border bg-card/80 inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-full border p-1">
            <span className="px-2">
              <span className="bg-muted/70 block h-3 w-7 animate-pulse rounded-full" />
            </span>
            <div className="bg-muted h-8 w-[4.25rem] animate-pulse rounded-full" />
            <div className="bg-muted h-8 w-[4.75rem] animate-pulse rounded-full" />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <div className="bg-muted h-9 w-[5.25rem] animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
