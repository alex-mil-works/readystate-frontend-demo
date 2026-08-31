import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parseInsightMarkdown } from '../../src/shared/lib/content/parse-markdown.js';
import {
  type LessonContent,
  LessonManifestSchema,
} from '../../src/shared/lib/content/schemas/lesson.js';
import { parseActivityYaml, parseManifestYaml } from './parse-yaml.js';
import { toRepoRelative } from './paths.js';

/** Load one lesson folder: lesson.yaml + insight markdown + activity yaml. */
export async function loadLesson(
  lessonDir: string,
  context?: { unitId?: string; stageId?: string },
): Promise<LessonContent> {
  const manifestPath = path.join(lessonDir, 'lesson.yaml');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = parseManifestYaml(
    manifestSource,
    LessonManifestSchema,
    toRepoRelative(manifestPath),
  );

  const insights = await Promise.all(
    manifest.insights.map(async (relativePath) => {
      const filePath = path.join(lessonDir, relativePath);
      const source = await readFile(filePath, 'utf8');
      return parseInsightMarkdown(source, toRepoRelative(filePath));
    }),
  );

  const activities = await Promise.all(
    manifest.activities.map(async (relativePath) => {
      const filePath = path.join(lessonDir, relativePath);
      const source = await readFile(filePath, 'utf8');
      return parseActivityYaml(source, toRepoRelative(filePath));
    }),
  );

  return {
    id: manifest.id,
    order: manifest.order,
    title: manifest.title,
    titleEn: manifest.titleEn,
    essence: manifest.essence,
    depth: manifest.depth,
    required: manifest.required,
    insights,
    activities,
    unitId: context?.unitId,
    stageId: context?.stageId,
  };
}
