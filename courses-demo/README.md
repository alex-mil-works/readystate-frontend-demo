# courses-demo

Public **demo** curriculum slice for ReadyState (committed).

- Synced from private `.courses/` via `yarn content:sync-demo`
- Includes full `discipline.yaml` + `skeleton.yaml` (empty stages → «Скоро»)
- Stack content is limited to stages listed in each `course.yaml` (today: **S01 only**)
- Local authoring stays in `.courses/` (gitignored)
- **Deploy/CI** compile this tree via GitHub Variables (`CONTENT_SOURCE=demo`, `VITE_DEMO=true`) — see [`.github/DEPLOY.md`](../.github/DEPLOY.md)

Do not hand-edit unless you intend a demo-only change; prefer sync from `.courses/`.
