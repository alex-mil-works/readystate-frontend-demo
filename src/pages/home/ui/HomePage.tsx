import { useNavigate, useParams } from 'react-router';

import { useDocumentTitle } from '@/shared/lib/use-document-title';

import { DISCIPLINE_ROLES, getRoleById } from '@/entities/discipline';

import {
  RoleStackSelector,
  coursePathForRoleStack,
  resolveCourseWorkspace,
  stackAfterRoleChange,
} from '@/features/select-role-stack';

import { CourseMap, CourseMapViewToolbar, WarmthLegend } from '@/widgets/course-map';

import { InvalidWorkspacePage } from '@/pages/not-found';

/** Course workspace: role/stack in the path, stage lesson map below.
 * Primary course is NOT updated here — only onboarding «Начать» / settings «Сделать основным». */
export function HomePage() {
  const { roleId, stackId } = useParams();
  const navigate = useNavigate();

  const pathRole = roleId ? decodeURIComponent(roleId) : undefined;
  const pathStack = stackId ? decodeURIComponent(stackId) : undefined;
  const role = pathRole ? getRoleById(pathRole) : undefined;
  const stack = role && pathStack ? role.stacks.find((item) => item.id === pathStack) : undefined;

  if (!pathRole || !pathStack || !role || !stack) {
    return <InvalidWorkspacePage roleId={pathRole} stackId={pathStack} />;
  }

  const workspace = resolveCourseWorkspace(role.id, stack.id, stack);
  const heading = workspace.kind === 'ready' ? workspace.course.title : stack.label;

  return (
    <HomeWorkspace
      heading={heading}
      role={role}
      stack={stack}
      workspace={workspace}
      onRoleSelect={(nextRoleId) => {
        const nextStack = stackAfterRoleChange(nextRoleId);
        void navigate(coursePathForRoleStack(nextRoleId, nextStack.id));
      }}
      onStackSelect={(nextStackId) => {
        void navigate(coursePathForRoleStack(role.id, nextStackId));
      }}
    />
  );
}

function HomeWorkspace({
  heading,
  role,
  stack,
  workspace,
  onRoleSelect,
  onStackSelect,
}: {
  heading: string;
  role: NonNullable<ReturnType<typeof getRoleById>>;
  stack: (typeof role.stacks)[number];
  workspace: ReturnType<typeof resolveCourseWorkspace>;
  onRoleSelect: (roleId: string) => void;
  onStackSelect: (stackId: string) => void;
}) {
  useDocumentTitle(heading);

  return (
    <div>
      <h1 className="sr-only">{heading}</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <RoleStackSelector
            roles={DISCIPLINE_ROLES}
            selectedRole={role}
            selectedStack={stack}
            onRoleSelect={onRoleSelect}
            onStackSelect={onStackSelect}
          />
        </div>
        {workspace.kind === 'ready' ? (
          <CourseMapViewToolbar course={workspace.course} className="self-end sm:self-center" />
        ) : null}
      </div>

      <div className="mt-4">
        <WarmthLegend />
      </div>

      <div className="mt-6">
        {workspace.kind === 'ready' ? (
          <CourseMap course={workspace.course} />
        ) : workspace.kind === 'coming_soon' ? (
          <p className="text-muted-foreground m-0 text-sm leading-relaxed">
            Этот стек скоро появится.
          </p>
        ) : (
          <p className="text-destructive m-0 text-sm leading-relaxed" role="alert">
            Курс не загружен. Скомпилируйте контент (`yarn content:compile`) и обновите страницу.
          </p>
        )}
      </div>
    </div>
  );
}
