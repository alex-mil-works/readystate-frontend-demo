import { GENERATED_DISCIPLINE_ROLES } from '@/shared/content/generated/disciplines';

export type DisciplineStack = {
  id: string;
  label: string;
  available: boolean;
};

export type DisciplineRole = {
  id: string;
  label: string;
  stacks: DisciplineStack[];
};

/** Canonical role/stack map. Source of truth: `.courses/<role>/discipline.yaml` via `yarn content:compile`. */
export const DISCIPLINE_ROLES: DisciplineRole[] = GENERATED_DISCIPLINE_ROLES.map((role) => ({
  id: role.id,
  label: role.label,
  stacks: role.stacks.map((stack) => ({
    id: stack.id,
    label: stack.label,
    available: stack.available,
  })),
}));

export const DEFAULT_ROLE_ID = DISCIPLINE_ROLES[0].id;
export const DEFAULT_STACK_ID = DISCIPLINE_ROLES[0].stacks.find((stack) => stack.available)!.id;

export function getRoleById(roleId: string): DisciplineRole | undefined {
  return DISCIPLINE_ROLES.find((role) => role.id === roleId);
}

/** Resolve stored ids to a valid available role/stack pair. */
export function resolveRoleStack(
  roleId: string,
  stackId: string,
): { role: DisciplineRole; stack: DisciplineStack } {
  const role = getRoleById(roleId) ?? DISCIPLINE_ROLES[0];
  const requested = role.stacks.find((stack) => stack.id === stackId);
  const stack =
    requested?.available === true
      ? requested
      : (role.stacks.find((item) => item.available) ?? role.stacks[0]);

  return { role, stack };
}

export function firstAvailableStack(role: DisciplineRole): DisciplineStack {
  return role.stacks.find((stack) => stack.available) ?? role.stacks[0];
}
