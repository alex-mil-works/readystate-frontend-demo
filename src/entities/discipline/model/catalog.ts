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

/** Minimal stub so imports work before remote load / in unit tests. */
const FALLBACK_ROLES: DisciplineRole[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    stacks: [
      { id: 'react', label: 'React', available: true },
      { id: 'angular', label: 'Angular', available: false },
      { id: 'vue', label: 'Vue', available: false },
    ],
  },
  {
    id: 'qa-automation',
    label: 'QA Automation',
    stacks: [
      { id: 'java', label: 'Java', available: true },
      { id: 'python', label: 'Python', available: false },
      { id: 'typescript', label: 'TypeScript', available: false },
    ],
  },
];

/** Canonical role/stack map — replaced at runtime from `GET /v1/disciplines`. */
export let DISCIPLINE_ROLES: DisciplineRole[] = FALLBACK_ROLES.map((role) => ({
  id: role.id,
  label: role.label,
  stacks: role.stacks.map((stack) => ({ ...stack })),
}));

export function replaceDisciplineRoles(roles: DisciplineRole[]): void {
  DISCIPLINE_ROLES = roles.map((role) => ({
    id: role.id,
    label: role.label,
    stacks: role.stacks.map((stack) => ({
      id: stack.id,
      label: stack.label,
      available: stack.available,
    })),
  }));
}

export const DEFAULT_ROLE_ID = DISCIPLINE_ROLES[0]!.id;
export const DEFAULT_STACK_ID = DISCIPLINE_ROLES[0]!.stacks.find((stack) => stack.available)!.id;

export function getRoleById(roleId: string): DisciplineRole | undefined {
  return DISCIPLINE_ROLES.find((role) => role.id === roleId);
}

/** Resolve stored ids to a valid available role/stack pair. */
export function resolveRoleStack(
  roleId: string,
  stackId: string,
): { role: DisciplineRole; stack: DisciplineStack } {
  const role = getRoleById(roleId) ?? DISCIPLINE_ROLES[0]!;
  const requested = role.stacks.find((stack) => stack.id === stackId);
  const stack =
    requested?.available === true
      ? requested
      : (role.stacks.find((item) => item.available) ?? role.stacks[0]!);

  return { role, stack };
}

export function firstAvailableStack(role: DisciplineRole): DisciplineStack {
  return role.stacks.find((stack) => stack.available) ?? role.stacks[0]!;
}
