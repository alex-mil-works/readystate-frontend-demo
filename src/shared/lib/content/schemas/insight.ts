import * as v from 'valibot';

export const InsightFrontmatterSchema = v.object({
  id: v.string(),
  kind: v.literal('insight'),
  title: v.string(),
  minutes: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
});

export type InsightFrontmatter = v.InferOutput<typeof InsightFrontmatterSchema>;

export type Insight = InsightFrontmatter & {
  /** Markdown body without frontmatter (for react-markdown). */
  markdown: string;
  /** Repo-relative path for diagnostics. */
  sourcePath: string;
};
