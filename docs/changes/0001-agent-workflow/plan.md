Status: approved

# Plan — 0001-agent-workflow

## Files
- `.gitignore` — deps, env, `brief.md`.
- `brief.md` — local, rewritten to what we build.
- `CLAUDE.md`, `.claude/skills/change/SKILL.md`, `.claude/agents/verifier.md`.
- `docs/changes/_template/*`, `docs/changes/0001-agent-workflow/*`.
- `docs/plan.md`, `docs/worklog.md`, `docs/product/*`, `docs/research/.gitkeep`.
- `README.md`.

## Steps
1. `.gitignore`, initial commit on `main`, branch `change/0001-agent-workflow`.
2. Brief rewritten and moved out of git.
3. Agent rules, skill, verifier, templates.
4. Product docs, roadmap, worklog, this change.
5. README.

## Risks
- Process overhead too big for a small app → `/change` steps stay short; trivial fixes skip it.

## Proof
- `git check-ignore brief.md` prints the path.
- Repo map paths exist.

## Divergence log
- Original brief moved to a local backup outside the repo instead of deleted.
