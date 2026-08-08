## Structure

Feature-Sliced Design with small ReadyState adaptations:

```text
src/
  app/                 # app bootstrap, providers, global styles
  pages/               # route-level screens (home for now)
  widgets/             # composite UI blocks
  features/            # user interactions (session, peek, revision, …)
  entities/            # business nouns (unit, activity, attempt, skill, …)
  shared/
    ui/                # primitives / semantic wrappers
    api/               # persistence adapters (Dexie later)
    lib/
      engine/          # pure domain: scoring, unlock, readiness
    config/            # app constants
content-demo/          # authored demo curriculum (content-as-code)
tools/content-compiler/# Node compiler → typed manifests
archive/               # local reference only (gitignored)
```
