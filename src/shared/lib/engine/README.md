# Pure domain engine (scoring / readiness / unlock)

No React, no Dexie. Call from features / `shared/api` after content is parsed.

Related map UX (not in this folder): **warmth** bands (`hot` / `warm` / `cold`) live in
`shared/lib/progress/warmth.ts` and feed the course-map dots from progress timestamps.
Review/Continue scheduling (due pool cards) is the next engine step beyond the `pickRecall` stub.
