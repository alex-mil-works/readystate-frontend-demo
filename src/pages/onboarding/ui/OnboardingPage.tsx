import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { AppBrandHeading, Button } from '@/shared/ui/kit';

import {
  DISCIPLINE_ROLES,
  firstAvailableStack,
  getRoleById,
  resolveRoleStack,
} from '@/entities/discipline';

import {
  RoleStackSelector,
  coursePathForRoleStack,
  firstLessonPathForCourse,
  resolveCourseWorkspace,
} from '@/features/select-role-stack';

function initialRoleStack(): { roleId: string; stackId: string } {
  const lastRoleId = useWorkspacePrefsStore.getState().lastRoleId;
  const lastStackId = useWorkspacePrefsStore.getState().lastStackId;
  if (lastRoleId && lastStackId) {
    const { role, stack } = resolveRoleStack(lastRoleId, lastStackId);
    if (stack.available) return { roleId: role.id, stackId: stack.id };
  }
  const role = DISCIPLINE_ROLES[0];
  return { roleId: role.id, stackId: firstAvailableStack(role).id };
}

/** Mini onboarding: role → stack → first lesson (or back to primary map). */
export function OnboardingPage() {
  useDocumentTitle('Старт');
  const navigate = useNavigate();
  const setLastWorkspace = useWorkspacePrefsStore((s) => s.setLastWorkspace);
  const lastRoleId = useWorkspacePrefsStore((s) => s.lastRoleId);
  const lastStackId = useWorkspacePrefsStore((s) => s.lastStackId);
  const hasPrimary = Boolean(lastRoleId && lastStackId);

  const initial = useMemo(() => initialRoleStack(), []);
  const [roleId, setRoleId] = useState(initial.roleId);
  const role = getRoleById(roleId) ?? DISCIPLINE_ROLES[0];
  const [stackId, setStackId] = useState(initial.stackId);

  const stack = useMemo(() => {
    const match = role.stacks.find((item) => item.id === stackId);
    return match?.available ? match : firstAvailableStack(role);
  }, [role, stackId]);

  const workspace = resolveCourseWorkspace(role.id, stack.id, stack);
  const canStart = workspace.kind === 'ready';

  const handleRoleSelect = (nextRoleId: string) => {
    setRoleId(nextRoleId);
    const nextRole = getRoleById(nextRoleId) ?? DISCIPLINE_ROLES[0];
    setStackId(firstAvailableStack(nextRole).id);
  };

  const handleStart = () => {
    if (workspace.kind !== 'ready') return;
    setLastWorkspace(role.id, stack.id);
    void navigate(firstLessonPathForCourse(workspace.course), { replace: true });
  };

  const handleGoToPrimaryMap = () => {
    if (!lastRoleId || !lastStackId) return;
    void navigate(coursePathForRoleStack(lastRoleId, lastStackId), { replace: true });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <AppBrandHeading size="lg" />
        {hasPrimary ? (
          <p className="text-muted-foreground mt-3 mb-0 text-sm leading-relaxed">
            Основной курс уже выбран. Можно открыть его карту или начать другой — он станет
            основным.
          </p>
        ) : null}
        <div className={hasPrimary ? 'mt-6' : 'mt-8'}>
          <RoleStackSelector
            roles={DISCIPLINE_ROLES}
            selectedRole={role}
            selectedStack={stack}
            onRoleSelect={handleRoleSelect}
            onStackSelect={setStackId}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={!canStart}
            onClick={handleStart}
          >
            Начать
          </Button>
          {hasPrimary ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleGoToPrimaryMap}
            >
              К основному курсу
            </Button>
          ) : null}
          {!canStart ? (
            <p className="text-muted-foreground mt-3 mb-0 w-full text-sm" role="status">
              Этот стек пока недоступен.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
