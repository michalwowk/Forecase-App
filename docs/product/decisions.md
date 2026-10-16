# Decisions

Format: `## D-NNN Title (date)` → Decision / Why / Rejected / Change.
Newest at the bottom. Never edit an old one; supersede it.

## D-001 English for all repo artifacts (2026-10-16)

- **Decision:** Docs, code, commits in English.
- **Why:** Reviewers read English. The brief is in English.
- **Change:** 0001

## D-002 Docs layout (2026-10-16)

- **Decision:** `docs/research`, `docs/plan.md` (roadmap), `docs/product/{vision,decisions,scoring,glossary}`, `docs/changes/NNNN-slug/{intent,spec,plan}`.
- **Why:** Stable product knowledge apart from per-change work. Each change shows its own reasoning.
- **Rejected:** Flat `docs/` with one spec/plan; one CHANGELOG file.
- **Change:** 0001

## D-003 Branch per change + PR (2026-10-16)

- **Decision:** `change/NNNN-slug` branch, PR into `main`. Agent never merges.
- **Why:** PRs show the process. Human gate on every merge.
- **Rejected:** Direct commits to `main`.
- **Change:** 0001

## D-004 Stack (2026-10-16) — superseded by D-008

- **Decision:** pnpm monorepo. `apps/api` Node + TS + graphql-yoga. `apps/web` Vite + React + TS. Vitest.
- **Why:** Brief asks for Node + GraphQL, team uses React + TS. Yoga and Vite are light and fast to set up.
- **Rejected:** Apollo Server + Client (more boilerplate); Next.js (not needed).
- **Change:** 0001, confirm in 0003.

## D-005 Worklog instead of published sessions (2026-10-16)

- **Decision:** No raw AI session exports. Process shown via `docs/worklog.md`, change folders, commits, PRs.
- **Why:** Raw sessions may leak local paths, tokens, private context.
- **Rejected:** Publishing session transcripts.
- **Change:** 0001

## D-006 Brief kept out of git (2026-10-16)

- **Decision:** Task text lives in gitignored `brief.md`, rewritten to what we build. Not quoted in docs.
- **Why:** Owner doesn't want the recruitment task public.
- **Rejected:** Committing the original brief.
- **Change:** 0001

## D-007 One skill for the whole change cycle (2026-10-16)

- **Decision:** `/change` drives intent → spec → plan → build → verify → close, with a stop after each artifact. Grilling built in.
- **Why:** One entry point is easier to follow than five skills. Gates keep human in charge.
- **Rejected:** Separate skills per step; single approval before code.
- **Change:** 0001

## D-008 No stack decision before discovery (2026-10-16)

- **Decision:** Stack and repo shape are decided in `0003-repo-scaffold`, from `0002-discovery` output. D-004 is withdrawn.
- **Why:** Don't decide how it looks before we know what we build.
- **Fixed by brief:** Node.js + GraphQL backend. React + TS front end is the default, not required.
- **Change:** 0001
