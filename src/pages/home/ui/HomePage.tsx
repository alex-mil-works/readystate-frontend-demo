import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { getCourseReviewPoolByRoleStack } from '@/shared/content/generated';
import { countDueReviewCards } from '@/shared/lib/engine';
import { courseCompositeId } from '@/shared/lib/progress';
import { useProgressStore } from '@/shared/lib/store/progress-store';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { Button } from '@/shared/ui/kit';

import { DISCIPLINE_ROLES, getRoleById } from '@/entities/discipline';

import {
  RoleStackSelector,
  coursePathForRoleStack,
  resolveCourseWorkspace,
  reviewPathForRoleStack,
  stackAfterRoleChange,
} from '@/features/select-role-stack';

import { CourseMap, CourseMapViewToolbar, WarmthLegend } from '@/widgets/course-map';
import { findContinueLessonTarget, lessonDomId } from '@/widgets/course-map/lib/continue-lesson';

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
  const navigate = useNavigate();

  const courseId = courseCompositeId(role.id, stack.id);
  const progressRecord = useProgressStore((s) => s.byCourseId[courseId]);

  const dueCount = useMemo(() => {
    if (workspace.kind !== 'ready') return 0;
    const pool = getCourseReviewPoolByRoleStack(role.id, stack.id);
    return countDueReviewCards({
      pool,
      scheduleByKey: progressRecord?.recallItems ?? {},
    });
  }, [workspace.kind, role.id, stack.id, progressRecord?.recallItems]);

  const continueTarget = useMemo(() => {
    if (workspace.kind !== 'ready') return null;
    return findContinueLessonTarget(workspace.course, progressRecord);
  }, [workspace, progressRecord]);

  useEffect(() => {
    if (!continueTarget) return;
    const id = lessonDomId(continueTarget.lessonId);
    let frames = 0;
    let frame = 0;
    const tick = () => {
      const node = document.getElementById(id);
      if (node) {
        node.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
      frames += 1;
      if (frames < 6) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [continueTarget]);

  const reviewPath = reviewPathForRoleStack(role.id, stack.id);
  const canReview = dueCount > 0;

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
          <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-center">
            <CourseMapViewToolbar course={workspace.course} />
          </div>
        ) : null}
      </div>

      {workspace.kind === 'ready' ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <WarmthLegend className="min-w-0 sm:max-w-[min(100%,36rem)]" />
          <div className="flex w-full shrink-0 justify-stretch sm:w-auto sm:justify-end">
            {canReview ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => void navigate(reviewPath)}
              >
                Повторение ({dueCount})
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled
                title="Пока нечего повторять. Пройдите уроки или загляните позже."
              >
                Повторение
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {!canReview && workspace.kind === 'ready' ? (
        <p className="text-muted-foreground mt-2 mb-0 text-sm" role="status">
          Пока нечего повторять. Пройдите уроки или загляните позже.
        </p>
      ) : null}

      <div className="mt-6">
        {workspace.kind === 'ready' ? (
          <CourseMap course={workspace.course} continueStageId={continueTarget?.stageId} />
        ) : workspace.kind === 'coming_soon' ? (
          <p className="text-muted-foreground m-0 text-sm leading-relaxed">
            Этот стек скоро появится.
          </p>
        ) : (
          <p className="text-destructive m-0 text-sm leading-relaxed" role="alert">
            Курс не загружен. Проверьте backend (`GET /v1/courses/...`) и `VITE_CONTENT_API_URL`,
            затем обновите страницу.
          </p>
        )}
      </div>
    </div>
  );
}
