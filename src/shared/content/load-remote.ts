import { CONTENT_API_URL } from '@/shared/config/content-source';

import { type DisciplineRole, replaceDisciplineRoles } from '@/entities/discipline';

import { type CourseContentBundle, replaceCompiledBundles } from './registry';

type DisciplinesResponse = {
  roles: DisciplineRole[];
};

type CourseResponse = {
  course: CourseContentBundle;
};

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${CONTENT_API_URL}${path}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Content API ${response.status} ${path}: ${body || response.statusText}`);
  }
  return (await response.json()) as T;
}

/** Fetch disciplines + every available stack course into the in-memory registry. */
export async function loadRemoteContent(): Promise<void> {
  const disciplines = await fetchJson<DisciplinesResponse>('/v1/disciplines');
  replaceDisciplineRoles(disciplines.roles);

  const available = disciplines.roles.flatMap((role) =>
    role.stacks
      .filter((stack) => stack.available)
      .map((stack) => ({ roleId: role.id, stackId: stack.id })),
  );

  const payloads = await Promise.all(
    available.map(({ roleId, stackId }) =>
      fetchJson<CourseResponse>(`/v1/courses/${roleId}/${stackId}`),
    ),
  );

  replaceCompiledBundles(payloads.map((payload) => payload.course));
}
