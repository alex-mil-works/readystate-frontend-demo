# Frontend — authoring layout

**Role:** `frontend` · **Stacks:** `react` | `angular` | `vue`

## Structure

```text
frontend/
  discipline.yaml       # role + stack list
  skeleton.yaml         # S01–S08 stage titles (form of the map)
  stacks/
    react/
      course.yaml       # stack meta + stage folder list
      content/
        s01-js-core/    # stage folder (stage.yaml id must match skeleton)
          u01-…/        # unit — silent group in UI (2–6 lessons)
          …
```

## Compile

From repo root:

```bash
yarn content:compile
```

Output: `src/shared/content/generated/frontend/react/course.json`

## Rules

- **Stages** come from `skeleton.yaml`; empty stages render as «Скоро».
- **Units** live only under stack `content/`; **2–6 lessons** per unit (min group rhythm + UI grid cap).
- **Lessons** use ids like `L001-js-values-model`; stable Dexie keys are `contentUid` in compiled JSON.
- Lesson URLs: `/courses/frontend/react/lessons/L001-js-values-model`
- Course map URL: `/courses/frontend/react`
- Compile also syncs `src/shared/content/generated/disciplines.ts` from this folder’s `discipline.yaml` (and sibling roles).
- Unit `activities/` folders feed post-lesson **+2 Recall** (`pickRecall`, scope `unit`).
- **YAML quote-lint:** do not write bare `null` / `~` / `{}` as field values — quote (`"null"`) or omit/fill real content; compile fails early with file:line.
- **Public demo:** `yarn content:sync-demo` copies stages listed in each `course.yaml` (S01) into committed `courses-demo/`. Local full tree stays in `.courses/`.

Legacy flat `react-frontend/` layout is removed (Phase 1 migration, 2026-08).
