# Deploy (CI approval → Vercel)

Deploy is the last job in [`.github/workflows/ci.yml`](workflows/ci.yml). It runs **only on push to `main`**, after lint, tests, e2e, and build. PRs run CI but skip deploy.

Vercel Git auto-deploy stays off (`vercel.json` → `"git.deploymentEnabled": false`).

Build environment: **GitHub Variables + Secrets**, not Vercel Project Settings.

## 1. GitHub Environment (approval gate)

Uses the repo environment **`Production`**:

1. **Settings → Environments → Production**
2. **Required reviewers** — e.g. `alex-mil-works` (configured)
3. **Allow administrators to bypass** — off (configured)

The deploy job waits here until a reviewer approves.

Optional: **Deployment branches** → limit to `main` only.

## 2. One-time: Vercel

1. Project → **Settings → Environment Variables** → **delete all** (GitHub is source of truth)
2. Copy **Project ID** → secret `VERCEL_PROJECT_ID`
3. Copy **Team / Org ID** → secret `VERCEL_ORG_ID`
4. Create token: [vercel.com/account/tokens](https://vercel.com/account/tokens) → secret `VERCEL_TOKEN`  
   Use a **full account token** (not project-scoped). Token must have access to the team that owns the project.

Copy IDs from **Project → Settings → General** (Project ID) and team/org ID (`team_…` under the team name).

## 3. GitHub Variables (repository)

**Settings → Secrets and variables → Actions → Variables**:

| Name                  | Value  |
| --------------------- | ------ |
| `CONTENT_SOURCE`      | `demo` |
| `VITE_CONTENT_SOURCE` | `demo` |
| `VITE_DEMO`           | `true` |

## 4. GitHub Secrets (repository)

**Settings → Secrets and variables → Actions → Secrets**:

| Name                 | Value                         |
| -------------------- | ----------------------------- |
| `VERCEL_TOKEN`       | Vercel API token              |
| `VERCEL_ORG_ID`      | Team/org ID                   |
| `VERCEL_PROJECT_ID`  | Project ID                    |
| `VITE_SITE_PASSWORD` | Demo gate password (optional) |

Repository-level secrets are enough. **Important:** if the same secret names exist under **Environment → Production**, those values **override** repository secrets — empty or wrong environment secrets break deploy.

## 5. Deploy flow (after push to `main`)

1. CI runs: lint → typecheck → Vitest → e2e → build
2. Job **Deploy to Vercel (approval)** waits on environment **Production**
3. Open the workflow run → **Review deployments** → **Approve and deploy**
4. Job compiles `courses-demo` (`yarn content:compile:demo`), runs `vercel build --prod` + `vercel deploy --prebuilt --prod`
5. Live site: [readystate-frontend-demo.vercel.app](https://readystate-frontend-demo.vercel.app) (URL in job Summary)

Deploy always uses `--prod` (production Vercel alias).

## 6. Verify

- Site loads at production URL
- Client-side routes work (refresh on `/courses/frontend/react`)
- Password gate if `VITE_SITE_PASSWORD` is set
- New push to `main` does not go live until approved

## FAQ

**`User not found` (404) on `vercel pull`?**  
Do **not** pass `--scope=$VERCEL_ORG_ID`. CLI `--scope` expects a **team slug** (e.g. `demo-cad5`), not `team_…`. The workflow uses env `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` only — no `--scope`.

**`Could not retrieve Project Settings` on pull/build?**  
Token must be a **full account** token with team access. `VERCEL_ORG_ID` = Team ID (`team_…`); `VERCEL_PROJECT_ID` = `prj_…`. The API check step must return HTTP 200.

**`No Project Settings found locally` on `vercel build`?**  
CLI needs a successful `vercel pull` first. Check secrets — **Environment → Production** overrides repository secrets if set (even empty).

**Why approval?**  
Separates “CI passed” from “ship to prod”.

**New push while waiting?**  
CI uses `cancel-in-progress: true`; a newer push may cancel the pending run. Approve promptly or deploy from the commit you want.

**Secrets vs Vercel env?**  
Not synced. Vercel project env should be empty; Actions passes env at `vercel build` time.

**Deploy failed on “Could not retrieve Project Settings”?**

1. **Environment → Production → Secrets** — remove empty overrides, or set correct `VERCEL_*` there.
2. Regenerate a **full account** token at [vercel.com/account/tokens](https://vercel.com/account/tokens) (not project-scoped).
3. `VERCEL_ORG_ID` = Team ID (`team_…` from team Settings → General), not slug.
4. `VERCEL_PROJECT_ID` = `prj_…` from Project → Settings → General.
5. Token must belong to an account with access to that team/project.  
   The workflow runs an API check before `vercel pull` — if that step fails, fix secrets first.

**Курс не загружен** on the live site?
Deploy build must compile `courses-demo` before Vite bundles JSON. The workflow runs `yarn content:compile:demo` and `vercel.json` uses the same in `buildCommand`. Re-deploy after a green CI run.

**`VITE_SITE_PASSWORD` security?**  
Embedded in the client bundle after build (soft gate only).
