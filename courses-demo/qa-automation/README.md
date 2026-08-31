# QA Automation — authoring layout

**Role:** `qa-automation` · **Stacks:** `java` | `python` | `typescript`

## Structure

```text
qa-automation/
  discipline.yaml       # role + stack list
  skeleton.yaml         # S01–S09 stage titles (form of the map)
  stacks/
    java/
      course.yaml       # stack meta + stage folder list
      content/
        s01-lang-foundations/
          u-lang-core/          # L001–L002
          u-lang-structures/    # L003–L004
          u-lang-oop/           # L005–L009
          u-lang-errors/        # L010–L011
          u-lang-collections/   # L012–L013
          u-lang-modern/        # L014–L015
          u-lang-io/            # L016–L017
```

## Compile

From repo root:

```bash
yarn content:compile
```

Output: `src/shared/content/generated/qa-automation/java/course.json`

## Rules

- **Stages** come from `skeleton.yaml`; empty stages render as «Скоро».
- **Units** are slot groups under stack `content/`; **2–6 lessons** per unit (min group rhythm + UI grid cap).
- **Lessons** use ids like `L001-java-syntax-primitives`; stable Dexie keys are `contentUid` in compiled JSON.
- Lesson URLs: `/courses/qa-automation/java/lessons/L001-java-syntax-primitives`
- Course map URL: `/courses/qa-automation/java`
- **S01 (Java) complete:** 7 units, 17 lessons (L001–L017), ~125 in-lesson activities; unit pools on all units + stage bridge pool.
- Compile also syncs role/stack catalog → `src/shared/content/generated/disciplines.ts`.
- Post-lesson **+2 Recall** reads the **unit** `activities/` pool via `pickRecall` (app).
- **YAML quote-lint:** bare `null` / `~` / `{}` fail compile early with file:line — quote or fill real content.
- **Public demo:** `yarn content:sync-demo` → committed `courses-demo/` (S01 from this tree). Full local authoring stays in `.courses/`.

Legacy flat `qa-java-automation/` layout is removed (Phase 2 migration, 2026-08).
