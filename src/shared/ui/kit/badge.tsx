import type { ComponentProps } from 'react';

import { Badge as PrimaryBadge, badgeVariants } from '@/shared/ui/primary/badge';

export type BadgeProps = ComponentProps<typeof PrimaryBadge>;

/** ReadyState badge (shadcn/Maia wrapper). */
export function Badge(props: BadgeProps) {
  return <PrimaryBadge {...props} />;
}

export { badgeVariants };
