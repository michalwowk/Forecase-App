Status: approved

# Intent — 0003-repo-scaffold

## Problem
- No code yet. Stack and repo shape were deferred until discovery (D-008).
- Later changes need a working base: tests, lint, typecheck, a path from web to API.

## Outcome
- Walking skeleton: API and web start separately or together with one command. Web calls a GraphQL `health` query and shows the result.
- `dev`, `test`, `lint`, `typecheck` work. Listed in `CLAUDE.md` Commands and README.
- GitHub Actions runs `lint`, `typecheck`, `test` on every PR.

## Users / systems affected
- Developers and agents working on `0004`+. Reviewers (CI status on PRs).

## Constraints
- Fixed by brief: Node.js + GraphQL backend, React + TypeScript frontend.
- No Open-Meteo, no scoring, no real UI. Those are `0004`–`0006`.
- No deploy. Hosting decided in `0008`.

## Open questions
- Libraries and repo structure → grilled at plan.
