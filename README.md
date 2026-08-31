# ReadyState

Local-first trainer for technical interview readiness (Frontend / Web).

**Знания, готовые к интервью**  
_Your knowledge, interview-ready._

## Content tree

```text
role → skeleton stages → stack (units + lessons) → steps
```

A **step** is one card inside a lesson: theory (**insight**) or an **activity** (`single_choice`, `predict_output`, `interview_phrasing`).

**Units** are silent visual groups in the map (max 6 lessons each). **Stages** are labeled; empty skeleton stages show «Скоро».

There is no checkpoint in the content model. Repeat pools (unit / stage / course) are compiled; `pickRecall` + post-lesson +2 use the unit pool.

## Stack

- Vite 8 + React 19 + TypeScript (strict)
- React Router (Data Mode)
- Tailwind CSS v4 + shadcn/ui (preset **Maia**) + Hugeicons
- Zustand (ephemeral UI) + **Dexie** (local progress) + Progress Document v1 export/import
- Valibot (theme persist + content schemas)
- Vitest + Testing Library + happy-dom
- Playwright (smoke e2e)
- Oxlint + Prettier (import order + Tailwind classes) + Husky / lint-staged
- Layout: Feature-Sliced Design (FSD)

## Scripts

```bash
yarn dev
yarn build
yarn typecheck
yarn lint
yarn format
yarn test             # Vitest watch
yarn test:run
yarn test:coverage
yarn test:e2e              # Playwright smoke (system Chrome; starts vite if needed)
yarn content:compile       # local: .courses → generated/
yarn content:compile:demo  # public slice: courses-demo → generated/
yarn content:sync-demo     # copy S01 (+ skeleton) from .courses → courses-demo/
yarn check                 # typecheck + lint + format:check + test:run
yarn ui:add <name>         # shadcn add → shared/ui/primary
```

## Requirements

- Node.js `>= 22.12.0`
- Yarn `4.x` (`packageManager` in `package.json`)

## Deploy (demo)

Public demo: [readystate-frontend-demo.vercel.app](https://readystate-frontend-demo.vercel.app)

| What                                      | How                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| **CI** (lint, unit/component, e2e, build) | Automatic on push/PR to `main` — [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |
| **Deploy**                                | Last CI job on **push to `main`** — approve environment **`Production`** → prod Vercel  |
| **Build env**                             | GitHub **Variables** + **Secrets** (not Vercel project env)                             |
| **Git → Vercel auto-deploy**              | Off — [`vercel.json`](vercel.json) `"git.deploymentEnabled": false`                     |

Full checklist: [`.github/DEPLOY.md`](.github/DEPLOY.md)

Local authoring uses `.env` (see [`.env.example`](.env.example)). Demo production builds use GitHub Variables (`CONTENT_SOURCE`, `VITE_*`) and Secrets (`VITE_SITE_PASSWORD`, `VERCEL_*`).

## Feature-Sliced Design

Import only downward:

| Layer      | Role                                                            | Now                                                     |
| ---------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| `app`      | bootstrap, router, providers, layouts, global styles            | `AppChromeLayout` wraps chrome routes                   |
| `pages`    | route screens (no `@/app` imports)                              | `home`, `onboarding`, `lesson`, `settings`, `not-found` |
| `widgets`  | large UI blocks                                                 | `course-map`                                            |
| `features` | user actions                                                    | `select-role-stack`                                     |
| `entities` | business entities                                               | `discipline`                                            |
| `shared`   | UI kit, utils, stores, api, validation, config, content, engine | yes (`pickRecall` in `lib/engine`)                      |

Inside a slice: `ui/` · `model/` · `api/` · `lib/` as needed.

**ReadyState extras**

- `shared/ui/primary` — raw shadcn/Maia primitives (CLI target)
- `shared/ui/kit` — thin wrappers (+ `Icon` / Hugeicons); pages import from here
- `shared/lib/content` — Valibot schemas + pure parsers (no `fs`)
- `shared/lib/engine` — pure domain (scoring/readiness), no React/Dexie
- `shared/lib/validation` — Valibot on trust boundaries
- `shared/lib/store` — Zustand for ephemeral UI only
- `shared/config` — app constants + course meta; maps from compiled JSON
- `tools/content-compiler` — loads `.courses/` YAML/MD manifests → JSON

```text
src/
  app/          # router, AppChromeLayout, providers, styles
  pages/        # home | onboarding | lesson | settings | not-found
  widgets/      # course-map
  features/     # select-role-stack
  entities/     # discipline
  shared/
    ui/primary | ui/kit
    lib/store | theme | validation | engine | content | progress | utils
    api/ config/ content/generated/
__tests__/
tools/content-compiler/
```

## App routes

| Route                                         | Screen                                    |
| --------------------------------------------- | ----------------------------------------- |
| `/`                                           | Primary workspace map, or `/onboarding`   |
| `/onboarding`                                 | Mini pick role/stack → first lesson       |
| `/courses/:roleId/:stackId`                   | Map (requires saved primary workspace)    |
| `/courses/:roleId/:stackId/lessons/:lessonId` | Lesson (requires saved primary workspace) |
| `/settings`                                   | Progress + transfer (same gate)           |
| `*` (unmatched)                               | Soft 404 → link home                      |

Query params are reserved for other UI state (not role/stack).

## UI / theme / validation

- Tokens: `src/app/styles/tokens.css` (`--rs-*`, light + `.dark`)
- Bridge: `src/app/styles/index.css`
- Theme: `useThemeStore` + `ThemeSync` + header icons → `.dark` on `<html>`
- Persist theme: Valibot `parseThemePersist` on localStorage read
- CLI: `components.json` → `ui`: `@/shared/ui/primary`, `iconLibrary`: `hugeicons`

## Notes

- Progress: Dexie (IndexedDB) + Settings JSON export/import (replace-all). Soft demo gate via `VITE_SITE_PASSWORD` (client bundle only).
- Gate = engine progression idea, not a lesson tile. No checkpoint in the map.
- **Warmth** (map indicator): knowledge “temperature” from last lesson activity (`lessonTimes` in progress).
  - Bands: `hot` (&lt;3d) · `warm` (&lt;14d) · `cold` (≥14d) · none if not started
  - Dot next to lesson title (grid/list) and stage title (coolest lesson in stage)
  - In-progress reopen refreshes activity; complete sets `completedAt` (re-complete refreshes)
  - Thresholds: `WARMTH_HOT_MS` / `WARMTH_WARM_MS` in `src/shared/lib/progress/warmth.ts`
- **Recall:** lesson keeps ≤1 inline Recall; bulk lives in unit/stage/course pools. After a lesson: optional +2 from the unit pool (`pickRecall`). Review/Continue (next) deals due Recall/Speak from pools.
- Step roles (EN pills): Read · Solve · Recall · Speak.
- Brand: inline `ReadyState | …` in header (slogan hidden below `sm`); soft 404 for unmatched routes.
- Unknown `/courses/:role/:stack` ids → «Курс не найден» (no silent redirect to default).
- Warmth legend strip under role/stack («Повторение» + phrases).
- Playwright smoke: `yarn test:e2e` (system Chrome on macOS 12; Vite binds `127.0.0.1:5173`).
- **Two curriculum roots:**
  - `.courses/` — full local authoring (**gitignored**)
  - `courses-demo/` — public S01 slice (**committed**); refresh with `yarn content:sync-demo`
- Flags: `VITE_DEMO` / `VITE_CONTENT_SOURCE` (`local` | `demo` | `remote`). Compiler uses the same via `CONTENT_SOURCE` / `COURSES_DIR` / `--demo`. **CI/deploy** set these in GitHub Variables — see [`.github/DEPLOY.md`](.github/DEPLOY.md).
- Authoring layout (discipline = role skeleton + stack fill):
  - `<root>/<role>/discipline.yaml` — role + stacks
  - `<root>/<role>/skeleton.yaml` — stage titles (form of the map)
  - `<root>/<role>/stacks/<stack>/course.yaml` — stack meta + stage folders
  - `stacks/<stack>/content/<stage>/stage.yaml` — units in stack
  - `<unit>/unit.yaml` — lessons (**2–6** per unit); units are silent groups in UI
  - Lesson ids are semantic: `L001-js-values-model`, `L001-java-syntax-primitives`
- Authoring flow: curriculum root → `yarn content:compile` → `src/shared/content/generated/<roleId>/<stackId>/course.json` (gitignored) → UI.
  See `courses-demo/README.md` and (locally) `.courses/*/README.md`.
- Tests: external `vitest.config.ts`, environment `happy-dom`, `__tests__/`; e2e in `e2e/`.

## Worklog

| When    | What                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| 2026-08 | Bootstrap: Vite/React/TS, FSD, Router, Vitest, Tailwind+Maia, Zustand, Valibot, Hugeicons |
| 2026-08 | UI skeleton: catalog `/`, course map `/courses/:id`, settings; layout prefs; AppLayout    |
| 2026-08 | Content schemas + U01 compiler; lesson player; checkpoint removed                         |
| 2026-08 | Step pills Read·Solve·Recall·Speak; recall pools model locked                             |
| 2026-08 | Multi-course compiler; U01+U02 (L001–L007); course/stage YAML; QA demo                    |
| 2026-08 | Home workspace `/?role=&stack=` (default React); no course cards; map on `/`              |
| 2026-08 | Discipline compiler (Phase 0): skeleton + stack → JSON; contentUid; stage map UI          |
| 2026-08 | Frontend React migrated to `.courses/frontend/stacks/react/` (Phase 1); S01–S08 skeleton  |
| 2026-08 | QA Java discipline migration (Phase 2); semantic lesson ids; `pages/home`                 |
| 2026-08 | Canonical paths `/courses/:role/:stack` (+ `/lessons/:id`); query params freed            |
| 2026-08 | QA Java S01 filled (L001–L017); unit size 2–6; home stack title; settings slim; pools     |
| 2026-08 | Collapsible stages; wrong-answer red bar; local progress + settings reset; catalog sync   |
| 2026-08 | pickRecall engine + post-lesson +2 Recall from unit pools                                 |
| 2026-08 | FSD: AppChromeLayout in router; drop empty catalog; archive seed script                   |
| 2026-08 | YAML quote-lint: bare `null`/`~`/`{}` fail compile early with file:line                   |
| 2026-08 | Dexie progress + Progress Document v1 JSON export/import (replace-all) in Settings        |
| 2026-08 | `courses-demo` + `content:sync-demo`; `VITE_DEMO` / `contentSource`; Demo pill            |
| 2026-08 | Missing-JSON alert vs «Скоро»; bonus red bar; expand/collapse; soft gate + robots         |
| 2026-08 | Soft 404; brand inline + narrow slogan hide; view toolbar pill; Playwright smoke          |
| 2026-08 | Warmth indicator (hot/warm/cold) on map lessons + stages; `lessonTimes` in progress       |
| 2026-08 | Warmth legend; invalid role/stack page; mobile header settings icon                       |
| 2026-08 | Onboarding; workspace prefs; settings (progress / primary / session); soft gate UX        |
| 2026-08 | GitHub Actions CI + manual Vercel deploy; env in GitHub (not Vercel dashboard)            |
| Next    | Review/Continue (due pools) → S02 content                                                 |
