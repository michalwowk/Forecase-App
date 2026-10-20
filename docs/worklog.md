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

## 2026-10-19 — 0002 discovery
- **What:** Open-Meteo research (4 notes + data selection), competitor review, 16 product/UI questions → D-009…D-015, final `vision.md` with ASCII sketch.
- **How:** 4 research subagents in parallel with live curl on 6 places. Product session one question at a time.
- **Calls I made:** Open-Meteo only (no OSM pistes); week grid UI; Unsafe state for storms, not for heavy rain; indoor complements outdoor; hourly windows instead of daily totals.
- **Findings that changed the product:** town height gives zero snow → elevation grid; inland marine returns nulls, not errors → "Not applicable".
- **Went wrong:** `data-selection.md` written before the decisions, so it went stale. Verifier caught it; rewritten.
- **Cut:** air quality (4.5-day horizon), i18n, unit toggle, hourly charts (later idea).

## 2026-10-20 — 0003 repo-scaffold (close)
- **What:** pnpm monorepo, Yoga API with `health`, Vite + React web with 3 states, Zod env, MSW tests, Biome, CI.
- **How:** Grilled choices into the plan, one commit per layer, human review of the running app.
- **Went wrong:** MSW 3 silently ignores the v2 option `onUnhandledRequest`. CRLF noise on Windows → `.gitattributes`.
- **Changed after review:** `APP_MODE` defaults to `production`; `pnpm dev` loads `.env.development`.
- **/simplify:** Zod `prettifyError`, Biome config trimmed to non-defaults, `start` without codegen, web moved to `features/` structure, absolute `@/` imports, API build (tsdown) + tsx dev.
- **Cut:** codegen once per install (kept per command, explicit), API codegen removal, `.gitignore` env rework.

## 2026-10-20 — 0004 scoring-engine (in progress)
- **What:** Intent, spec, plan approved. `scoring.md`, D-016…D-021. Config schema, metric rules, days/windows/coverage.
- **How:** One question at a time with a recommendation. Live curl before deciding surf wind.
- **I corrected the agent:**
  - Brought a tech choice (Strategy) into spec grilling → moved to plan.
  - Settled for "wind speed only" on surf → I asked what the API can really give; it found the sea bearing.
  - Didn't think about who the user is (pro vs hobbyist) → I raised it.
  - Indoor as pure inverse of outdoor → ignored the trip to the museum and safety.
  - Indoor coupled to outdoor → I asked for config only; requirements may flip.
  - Copied the outdoor window to indoor → museums are also visited in the evening.
  - Put an indoor example in the spec without computing it → wrong numbers, rewritten.
  - Didn't log my corrections as we went → I had to ask.
- **Didn't fit:** Too many comments in the values file → moved to `schema.ts` JSDoc.
- **Had to ask to understand:** `invert`, `floor`, `band`, `aggregate`, config variables. New terms came without explanation → asked for ASCII graphs in the schema.
- **I asked for:** easy config for business; "Needs PO/PM review" on numbers I can't judge; simple scoring docs with weights.
