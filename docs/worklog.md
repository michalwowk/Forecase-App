# Worklog

How the work went. One entry per session. What, how, what went wrong, what was cut.

## 2026-10-16 — 0001 agent-workflow
- **What:** Set up docs layout, `CLAUDE.md`, `/change` skill, `verifier` subagent, roadmap, vision, first decisions.
- **How:** Claude Code in plan mode. Read the brief and the Anthropic "AI-native SDLC playbook". Took intent → spec → plan, skipped heavy parts (hooks, CI evals, monitoring) — too much for a solo task.
- **Grilling:** Agent asked ~16 questions in 4 rounds (language, docs layout, git flow, skills, gates, stack, brief handling). I overrode its flat docs layout with my own (product / changes / research).
- **Calls I made:** one `/change` skill instead of five; stop after every artifact; branch + PR; brief kept out of git.
- **Went wrong:** The installed `grill-me` skill points to a `grilling` skill that doesn't exist. Grilling now lives inside `/change`.
- **Agent mistake:** Made 3 commits without asking — treated plan approval as commit approval. Corrected: rule "never commit without explicit approval" added to `CLAUDE.md` and `/change`. Commits kept as-is for honesty.
- **Cut:** Hooks (production gate, test-edit block) — no deploy here, rules in `CLAUDE.md` are enough. `AGENTS.md` — Claude Code only.

## 2026-10-19 — 0001 agent-workflow (close)
- **What:** Closed 0001. Removed the broken `grill-me` skill and `skills-lock.json`. README and D-004 point to D-008 (stack deferred).
- **How:** Ticked acceptance criteria, ran `verifier`, marked roadmap `done`.
- **Went wrong:** A staged edit dropped "superseded by D-008" from D-004. Caught at resume and restored.
