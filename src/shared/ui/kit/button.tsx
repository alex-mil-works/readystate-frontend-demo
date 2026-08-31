import type { ComponentProps } from 'react';

import { Button as PrimaryButton, buttonVariants } from '@/shared/ui/primary/button';

export type ButtonProps = ComponentProps<typeof PrimaryButton>;

/** ReadyState button (shadcn/Maia wrapper). */
export function Button(props: ButtonProps) {
  return <PrimaryButton {...props} />;
}

export { buttonVariants };
