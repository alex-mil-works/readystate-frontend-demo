/** Course catalog metadata (committed). Full maps come from compiled JSON locally. */
import {
  getCompiledCourse,
  getCompiledCourseByRoleStack,
  listCompiledCourses,
} from '@/shared/content/generated';
import { courseCompositeId } from '@/shared/lib/progress';

import type { CoursePreview } from './course-model';

type CatalogMeta = Omit<CoursePreview, 'units' | 'stages'>;

/** Fallback catalog when compiled JSON is absent (CI / fresh clone). */
const COURSE_CATALOG_META: CatalogMeta[] = [
  {
    id: courseCompositeId('frontend', 'react'),
    title: 'React Frontend',
    titleEn: 'React Frontend',
    description: 'Основной курс MVP: готовность к frontend-интервью.',
    roleId: 'frontend',
    roleLabel: 'Frontend',
    stackId: 'react',
    stackLabel: 'React',
    status: 'preview',
    statusLabel: 'Preview',
  },
  {
    id: courseCompositeId('qa-automation', 'java'),
    title: 'QA Automation (Java)',
    titleEn: 'QA Automation (Java)',
    description: 'Автотесты на Java: Selenium, Maven, TestNG и CI/CD.',
    roleId: 'qa-automation',
    roleLabel: 'QA Automation',
    stackId: 'java',
    stackLabel: 'Java',
    status: 'preview',
    statusLabel: 'Preview',
  },
];

const CATALOG_META_BY_ID = new Map(COURSE_CATALOG_META.map((meta) => [meta.id, meta]));

const CATALOG_META_BY_ROLE_STACK = new Map(
  COURSE_CATALOG_META.map((meta) => [courseCompositeId(meta.roleId!, meta.stackId!), meta]),
);

/** Legacy flat course folder ids → composite id (redirects). */
const LEGACY_COURSE_ID_ALIASES: Record<string, string> = {
  'react-frontend': courseCompositeId('frontend', 'react'),
  'qa-java-automation': courseCompositeId('qa-automation', 'java'),
};

function resolveCourseId(courseId: string): string {
  return LEGACY_COURSE_ID_ALIASES[courseId] ?? courseId;
}

function findCatalogMeta(course: CoursePreview): CatalogMeta | undefined {
  const byId = CATALOG_META_BY_ID.get(course.id);
  if (byId) return byId;

  if (course.roleId && course.stackId) {
    return CATALOG_META_BY_ROLE_STACK.get(courseCompositeId(course.roleId, course.stackId));
  }

  return undefined;
}

function decorateCourse(course: CoursePreview): CoursePreview {
  const meta = findCatalogMeta(course);
  if (!meta) return course;
  return {
    ...course,
    id: course.id || courseCompositeId(meta.roleId!, meta.stackId!),
    roleId: course.roleId ?? meta.roleId,
    roleLabel: meta.roleLabel,
    stackId: course.stackId ?? meta.stackId,
    stackLabel: meta.stackLabel,
  };
}

/** Courses available in the app: compiled bundles first, else catalog meta with empty map. */
function listCourses(): CoursePreview[] {
  const compiled = listCompiledCourses();
  if (compiled.length > 0) return compiled.map(decorateCourse);

  return COURSE_CATALOG_META.map((meta) => ({ ...meta, stages: [], units: [] }));
}

export function getCourseById(courseId: string): CoursePreview | undefined {
  const resolved = resolveCourseId(courseId);
  const compiled = getCompiledCourse(resolved);
  if (compiled) return decorateCourse(compiled);
  return listCourses().find((course) => course.id === resolved || course.id === courseId);
}

export function getCourseByRoleStack(roleId: string, stackId: string): CoursePreview | undefined {
  const compiled = getCompiledCourseByRoleStack(roleId, stackId);
  if (compiled) return decorateCourse(compiled);

  return listCourses().find((course) => course.roleId === roleId && course.stackId === stackId);
}
