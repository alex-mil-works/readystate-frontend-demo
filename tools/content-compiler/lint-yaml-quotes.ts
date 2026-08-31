/**
 * Catch authoring footguns before Valibot: bare YAML `null` / `~` / `{}`
 * become real null/empty objects and fail string/array schemas with cryptic errors.
 * Authors usually meant the text "null" or forgot a field — quote or omit.
 */

const NULLISH = new Set(['null', '~', 'Null', 'NULL']);

export type YamlQuoteLintIssue = {
  line: number;
  column: number;
  raw: string;
  hint: string;
};

/** Scan YAML source for unquoted null / empty-mapping values. */
export function lintYamlQuotes(source: string): YamlQuoteLintIssue[] {
  const issues: YamlQuoteLintIssue[] = [];
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // key: null | key: ~  (unquoted)
    const nullMatch = line.match(/^(\s*[^:#\s][^:#]*):\s*(null|~|Null|NULL)\s*(?:#.*)?$/);
    if (nullMatch && NULLISH.has(nullMatch[2]!)) {
      const column = line.indexOf(nullMatch[2]!) + 1;
      issues.push({
        line: i + 1,
        column,
        raw: nullMatch[2]!,
        hint: `unquoted ${nullMatch[2]} becomes YAML null — quote as "${nullMatch[2]}" or fill real text`,
      });
      continue;
    }

    // key: {}  or key: { }
    const emptyMapMatch = line.match(/^(\s*[^:#\s][^:#]*):\s*\{\s*\}\s*(?:#.*)?$/);
    if (emptyMapMatch) {
      const column = line.indexOf('{') + 1;
      issues.push({
        line: i + 1,
        column,
        raw: '{}',
        hint: 'empty mapping {} is not valid content — omit the key or provide a real object/list',
      });
    }
  }

  return issues;
}

/** Throw a single error listing all quote-lint issues for this file. */
export function assertYamlQuotes(source: string, sourcePath: string): void {
  const issues = lintYamlQuotes(source);
  if (issues.length === 0) return;

  const details = issues
    .map((issue) => `  ${sourcePath}:${issue.line}:${issue.column}: ${issue.hint}`)
    .join('\n');

  throw new Error(
    `YAML quote-lint failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):\n${details}`,
  );
}
