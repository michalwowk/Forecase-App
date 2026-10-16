# Forecase

Enter a city or town. See how good each of the next 7 days is for skiing, surfing, outdoor sightseeing and indoor sightseeing.
Weather from [Open-Meteo](https://open-meteo.com/). Node + GraphQL backend owns the scoring. React + TS frontend shows it.

> Status: setup done (change `0001`). App not built yet. See [roadmap](docs/plan.md).

## Where to find what

| Path | What |
|---|---|
| `apps/api` | GraphQL API (from `0003`) |
| `apps/web` | Web UI (from `0003`) |
| [`docs/plan.md`](docs/plan.md) | Roadmap of changes + status |
| [`docs/changes/`](docs/changes/) | One folder per change: `intent.md`, `spec.md`, `plan.md` |
| [`docs/product/vision.md`](docs/product/vision.md) | What we build and why |
| [`docs/product/decisions.md`](docs/product/decisions.md) | Every product and process decision |
| [`docs/product/scoring.md`](docs/product/scoring.md) | Scoring rules per activity + reasoning |
| [`docs/product/glossary.md`](docs/product/glossary.md) | Terms |
| [`docs/research/`](docs/research/) | Research notes |
| [`docs/worklog.md`](docs/worklog.md) | How the work actually went |
| [`CLAUDE.md`](CLAUDE.md) | Rules for AI agents |
| [`.claude/`](.claude/) | `/change` skill, `verifier` subagent |

## How to run
TBD after `0003-monorepo-scaffold`.

## Assumptions
- No persistence. Open-Meteo called per request.
- More in [vision](docs/product/vision.md) open questions; resolved ones move to [decisions](docs/product/decisions.md).

## How we work with agents
- **Unit of work = a change.** `docs/changes/NNNN-slug/` + branch `change/NNNN-slug` + PR.
- **Cycle:** intent → spec → plan → build → verify → close. Based on Anthropic's [AI-native SDLC playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), cut down to what a solo task needs.
- **One entry point:** `/change <slug>` runs the whole cycle. It grills me with questions before intent and spec.
- **Human gates:** I approve intent, spec and plan before the agent moves on. I merge every PR. The agent never pushes to `main`.
- **Decisions:** every business or product call is mine and goes to `decisions.md`.
- **Verification:** tests, then the `verifier` subagent checks the diff against the spec. It reports, never fixes.
- **Plan drift:** if build differs from plan, `plan.md` is updated in the same commit.
- **Learning:** the same agent mistake twice → a new rule in `CLAUDE.md`.
- **Sessions:** raw AI transcripts are not published (may leak local context). `worklog.md`, change folders, commits and PRs show the process instead.

## Cut / not done
- Hooks, CI evals, monitoring from the playbook — no deploy target, solo work.
