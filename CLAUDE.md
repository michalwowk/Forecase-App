# CLAUDE.md

Rules for agents in this repo. Short. Add a rule when the same mistake happens twice.

## Context
- Product: rank the next 7 days for skiing, surfing, outdoor and indoor sightseeing in a city. See `docs/product/vision.md`.
- Local brief: `brief.md` (gitignored). Read it, never commit it, never quote it in docs.
- Stack: pnpm monorepo. `apps/api` Node + TS + graphql-yoga. `apps/web` Vite + React + TS. Vitest.

## Workflow
- Every non-trivial piece of work is a change. Run `/change <slug>`.
- Cycle: intent → spec → plan → build → verify → close. Stop for human approval after intent, spec and plan.
- One branch per change: `change/NNNN-slug`. Small commits.
- Never merge, never push to `main`. Ask before any push or PR.
- Plan diverges during build → update the change's `plan.md` in the same commit.
- Verification: run tests, then the `verifier` subagent. It reports; you fix.

## Decisions
- Business and product calls belong to the human. Ask, don't decide silently.
- Record every decision in `docs/product/decisions.md` (mini-ADR format).
- Scoring logic and its reasoning live in `docs/product/scoring.md`.

## Code
- Don't weaken or delete tests to make them pass.
- No secrets in code or docs.

## Writing
- English in all repo artifacts.
- Short sentences. Bullets over prose. No filler.
- A doc over ~60 lines is a smell. Split or cut.

## Docs map
- `docs/plan.md` — roadmap of changes + status.
- `docs/changes/NNNN-slug/` — intent, spec, plan per change. Template in `_template/`.
- `docs/product/` — vision, decisions, scoring, glossary.
- `docs/research/` — research notes.
- `docs/worklog.md` — how the work went, session by session.

## Commands
- TBD after `0003-monorepo-scaffold`.
