import * as v from 'valibot';

/** Role of an activity in the lesson flow (Solve / Recall / Speak). Not progress. */
export const ActivityPhaseSchema = v.picklist(['practice', 'revision', 'phrasing']);

export type ActivityPhase = v.InferOutput<typeof ActivityPhaseSchema>;

/** Optional theoretical hints (Recall): shown in a popup before / while answering. */
export const ActivityHintSchema = v.object({
  title: v.string(),
  markdown: v.string(),
});

export type ActivityHint = v.InferOutput<typeof ActivityHintSchema>;

/** Optional metadata for pool (and future lesson) activities. */
const ActivityMetaFields = {
  tags: v.optional(v.array(v.string())),
  reinforces: v.optional(v.array(v.string())),
  source: v.optional(v.picklist(['original', 'web'])),
  /** Theory snippets for Recall (`phase: revision`). One or more insights. */
  hints: v.optional(v.pipe(v.array(ActivityHintSchema), v.minLength(1))),
};

const ChoiceOptionSchema = v.object({
  id: v.string(),
  text: v.string(),
  correct: v.optional(v.literal(true)),
});

export type ChoiceOption = v.InferOutput<typeof ChoiceOptionSchema>;

const withOneCorrect = <T extends { options: ChoiceOption[] } | { choices: ChoiceOption[] }>(
  label: string,
) =>
  v.check((entry: T) => {
    const options = 'options' in entry ? entry.options : entry.choices;
    return options.some((option) => option.correct === true);
  }, `${label} must have exactly one option with correct: true`);

export const SingleChoiceActivitySchema = v.pipe(
  v.object({
    id: v.string(),
    kind: v.literal('single_choice'),
    phase: ActivityPhaseSchema,
    prompt: v.string(),
    options: v.pipe(v.array(ChoiceOptionSchema), v.minLength(2)),
    explain: v.string(),
    ...ActivityMetaFields,
  }),
  withOneCorrect('single_choice'),
);

export type SingleChoiceActivity = v.InferOutput<typeof SingleChoiceActivitySchema>;

export const PredictOutputActivitySchema = v.pipe(
  v.object({
    id: v.string(),
    kind: v.literal('predict_output'),
    phase: ActivityPhaseSchema,
    code: v.string(),
    question: v.string(),
    choices: v.pipe(v.array(ChoiceOptionSchema), v.minLength(2)),
    explain: v.string(),
    ...ActivityMetaFields,
  }),
  withOneCorrect('predict_output'),
);

export type PredictOutputActivity = v.InferOutput<typeof PredictOutputActivitySchema>;

export const InterviewPhrasingActivitySchema = v.object({
  id: v.string(),
  kind: v.literal('interview_phrasing'),
  phase: v.literal('phrasing'),
  prompt: v.string(),
  rubric: v.string(),
  sampleAnswer: v.string(),
  ...ActivityMetaFields,
});

export type InterviewPhrasingActivity = v.InferOutput<typeof InterviewPhrasingActivitySchema>;

export const ActivitySchema = v.variant('kind', [
  SingleChoiceActivitySchema,
  PredictOutputActivitySchema,
  InterviewPhrasingActivitySchema,
]);

export type Activity = v.InferOutput<typeof ActivitySchema> & {
  /** Stable Dexie key segment; set by compiler from role/stack context. */
  contentUid?: string;
};

/** Where a pool activity lives in the course tree. */
export const PoolScopeSchema = v.picklist(['unit', 'stage', 'course']);

export type PoolScope = v.InferOutput<typeof PoolScopeSchema>;

/** Activity from a unit/stage/course pool (Recall / Speak bank). */
export type PoolActivity = Activity & {
  scope: PoolScope;
  courseId: string;
  stageId?: string;
  unitId?: string;
  sourcePath: string;
  /** Stable Dexie key segment; set by compiler. */
  contentUid?: string;
};
