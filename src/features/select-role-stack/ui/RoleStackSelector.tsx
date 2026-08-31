import { Badge, Button } from '@/shared/ui/kit';

import type { DisciplineRole, DisciplineStack } from '@/entities/discipline';

function ComingSoonBadge() {
  return (
    <Badge variant="secondary" className="ml-1">
      Скоро
    </Badge>
  );
}

function OptionSegmented<T extends { id: string; label: string; available?: boolean }>({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  options: T[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="border-border bg-card/80 inline-flex max-w-full flex-wrap gap-0.5 rounded-full border p-1"
      role="group"
      aria-label={label}
    >
      <span
        className="text-muted-foreground flex items-center px-2 text-xs font-medium"
        aria-hidden
      >
        {label}
      </span>
      {options.map((option) => {
        const disabled = option.available === false;
        const selected = selectedId === option.id && !disabled;

        return (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={selected ? 'default' : 'ghost'}
            className="rounded-full"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
            {disabled ? <ComingSoonBadge /> : null}
          </Button>
        );
      })}
    </div>
  );
}

type SelectorProps = {
  roles: DisciplineRole[];
  selectedRole: DisciplineRole;
  selectedStack: DisciplineStack;
  onRoleSelect: (roleId: string) => void;
  onStackSelect: (stackId: string) => void;
};

/** Role and stack as segmented controls with in-capsule labels. */
export function RoleStackSelector({
  roles,
  selectedRole,
  selectedStack,
  onRoleSelect,
  onStackSelect,
}: SelectorProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
      <OptionSegmented
        label="Роль"
        options={roles}
        selectedId={selectedRole.id}
        onSelect={onRoleSelect}
      />
      <OptionSegmented
        label="Стек"
        options={selectedRole.stacks}
        selectedId={selectedStack.id}
        onSelect={onStackSelect}
      />
    </div>
  );
}
