import * as v from 'valibot';

/** Validate with Valibot; throw a clear error that includes the source path. */
export function parseOrThrow<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  schema: TSchema,
  input: unknown,
  context: string,
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, input);
  if (result.success) return result.output;

  const details = result.issues
    .map((issue) => {
      const path = issue.path?.map((segment) => segment.key).join('.') ?? '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');

  throw new Error(`${context}: ${details}`);
}
