/**
 * App UI kit: thin wrappers over `shared/ui/primary` (shadcn/Maia).
 * Import from here, not from `primary`, so pages stay stable if Maia changes.
 */
export { AppBrand, AppBrandHeading } from './app-brand';

export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export { Icon } from './icon';

export { AppBootSkeleton } from './app-boot-skeleton';

export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
