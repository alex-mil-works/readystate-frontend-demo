import { parse as parseYaml } from 'yaml';

import { parseOrThrow } from './parse-or-throw';
import { type Insight, InsightFrontmatterSchema } from './schemas/insight';

export type ParsedMarkdown = {
  frontmatter: Record<string, unknown>;
  body: string;
};

/** Split YAML frontmatter and markdown body. */
export function splitMarkdownFrontmatter(source: string): ParsedMarkdown {
  const trimmed = source.startsWith('\uFEFF') ? source.slice(1) : source;
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: trimmed };
  }

  const closing = trimmed.indexOf('\n---', 3);
  if (closing === -1) {
    throw new Error('Markdown frontmatter: missing closing ---');
  }

  const rawYaml = trimmed.slice(3, closing).trim();
  const body = trimmed.slice(closing + 4).replace(/^\n/, '');

  const frontmatter = rawYaml ? (parseYaml(rawYaml) as Record<string, unknown>) : {};

  return { frontmatter, body };
}

/** Validate insight frontmatter and attach the markdown body. */
export function parseInsightMarkdown(source: string, sourcePath: string): Insight {
  const { frontmatter, body } = splitMarkdownFrontmatter(source);
  const meta = parseOrThrow(InsightFrontmatterSchema, frontmatter, sourcePath);

  return {
    ...meta,
    markdown: body.trim(),
    sourcePath,
  };
}
