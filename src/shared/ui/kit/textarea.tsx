import type { ComponentProps } from 'react';

import { Textarea as PrimaryTextarea } from '@/shared/ui/primary/textarea';

export type TextareaProps = ComponentProps<typeof PrimaryTextarea>;

/** ReadyState textarea (shadcn/Maia wrapper). */
export function Textarea(props: TextareaProps) {
  return <PrimaryTextarea {...props} />;
}
