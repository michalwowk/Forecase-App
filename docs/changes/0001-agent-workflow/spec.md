Status: approved

# Spec — 0001-agent-workflow

## Requirements
- Docs layout per D-002.
- `CLAUDE.md` with collaboration rules.
- `/change` skill: full cycle with approval gates, grilling built in.
- `verifier` subagent: report only.
- README: what, where, how to run, assumptions, how we work with agents, cuts.

## Behaviour
- `/change <slug>` creates the folder from `_template`, a branch, a roadmap row.
- Resumes at the first artifact with `Status: draft`.
- Never merges, asks before push/PR.

## Interface
- `.claude/skills/change/SKILL.md`, `.claude/agents/verifier.md`, `docs/**`.

## Out of scope
- Hooks, CI evals, monitoring — no deploy target, solo work.
- `AGENTS.md` — Claude Code only.
- Open-Meteo research — `0002`.

## Acceptance criteria
- [x] Every path in the README repo map exists.
- [x] `brief.md` is gitignored and absent from history.
- [x] `/change` and `verifier` are discoverable by Claude Code.
- [x] Decisions from the grilling are in `decisions.md`.
