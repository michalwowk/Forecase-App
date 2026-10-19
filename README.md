# Forecase

Enter a city or town. See how good each of the next 7 days is for skiing, surfing, outdoor sightseeing and indoor sightseeing.
Weather from [Open-Meteo](https://open-meteo.com/). Node + GraphQL backend owns the scoring. Frontend not chosen yet (React + TS is the default, see D-008).

> Status: discovery done (change `0002`). App not built yet. See [roadmap](docs/plan.md).

## Where to find what

| Path | What |
|---|---|
| [`apps/api`](apps/api) | Node + GraphQL Yoga API. Contract: `schema.graphql` |
| [`apps/web`](apps/web) | React + Vite web app |
| [`docs/plan.md`](docs/plan.md) | Roadmap of changes + status |
| [`docs/changes/`](docs/changes/) | One folder per change: `intent.md`, `spec.md`, `plan.md` |
| [`docs/product/vision.md`](docs/product/vision.md) | What we build and why |
| [`docs/product/decisions.md`](docs/product/decisions.md) | Product and UI decisions (D-001…D-008 also cover setup) |
| [`docs/product/scoring.md`](docs/product/scoring.md) | Scoring rules per activity + reasoning |
| [`docs/product/glossary.md`](docs/product/glossary.md) | Terms |
| [`docs/research/`](docs/research/) | Research notes |
| [`docs/worklog.md`](docs/worklog.md) | How the work actually went |
| [`CLAUDE.md`](CLAUDE.md) | Rules for AI agents |
| [`.claude/`](.claude/) | `/change` skill, `verifier` subagent |

## How to run
Needs Node 24 and pnpm.

```sh
pnpm install
pnpm dev          # API on :4000, web on http://localhost:5173
```

- One app only: `pnpm --filter api dev` or `pnpm --filter web dev`.
- Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`. CI runs the same on every PR.
- Config is optional: see `apps/*/.env.example`. `APP_MODE` = `development` | `test` | `production`.

## Assumptions
- No persistence. Open-Meteo only, called per request (4 calls per search).
- Skiing uses the highest terrain nearby, not resort data. Surfing uses the sea near the town, not a specific beach.
- A day is local time, scored on an hour window per activity.
- Free Open-Meteo tier: non-commercial use, attribution shown in the UI.
- Full list: [vision](docs/product/vision.md) and [decisions](docs/product/decisions.md).

## How we work with agents
- **Unit of work = a change.** `docs/changes/NNNN-slug/` + branch `change/NNNN-slug` + PR.
- **Cycle:** intent → spec → plan → build → verify → close. Based on Anthropic's [AI-native SDLC playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), cut down to what a solo task needs.
- **One entry point:** `/change <slug>` runs the whole cycle. It asks short questions at intent and grills me at spec (and plan, when technical choices are open).
- **Human gates:** I approve intent, spec and plan before the agent moves on. I merge every PR. The agent never pushes to `main`.
- **Decisions:** every business or product call is mine and goes to `decisions.md`.
- **Verification:** tests, then the `verifier` subagent checks the diff against the spec. It reports, never fixes.
- **Plan drift:** if build differs from plan, `plan.md` is updated in the same commit.
- **Learning:** the same agent mistake twice → a new rule in `CLAUDE.md`.
- **Sessions:** raw AI transcripts are not published (may leak local context). `worklog.md`, change folders, commits and PRs show the process instead.

## Cut / not done
- Hooks, CI evals, monitoring from the playbook — no deploy target, solo work.
- Log storage and observability (Sentry, Grafana) — nowhere to ship logs. API logs to stdout with pino.
- Docker, pre-commit hooks — local Node + CI on PRs is enough.
