import type { BaseIssue, BaseSchema, InferOutput } from 'valibot';
import { parse as parseYaml } from 'yaml';

import { parseOrThrow } from '../../src/shared/lib/content/parse-or-throw.js';
import { type Activity, ActivitySchema } from '../../src/shared/lib/content/schemas/activity.js';
import { assertYamlQuotes } from './lint-yaml-quotes.js';

/** Parse and validate one activity YAML file. */
export function parseActivityYaml(source: string, sourcePath: string): Activity {
  assertYamlQuotes(source, sourcePath);
  const doc = parseYaml(source);
  return parseOrThrow(ActivitySchema, doc, sourcePath);
}

/** Parse and validate a lesson/unit (or other) YAML manifest. */
export function parseManifestYaml<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  source: string,
  schema: TSchema,
  sourcePath: string,
): InferOutput<TSchema> {
  assertYamlQuotes(source, sourcePath);
  const doc = parseYaml(source);
  return parseOrThrow(schema, doc, sourcePath);
}
