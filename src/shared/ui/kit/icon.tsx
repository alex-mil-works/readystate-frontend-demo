import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';

type IconProps = {
  icon: IconSvgElement;
  size?: number;
  className?: string;
};

/** Hugeicons wrapper; inherits current text color. */
export function Icon({ icon, size = 18, className }: IconProps) {
  return <HugeiconsIcon icon={icon} size={size} className={className} color="currentColor" />;
}
