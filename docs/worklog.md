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
- **What:** Intent, spec, plan approved. `scoring.md` with every rule and its "why". D-016…D-021. Config schema + default config.
- **How:** One question at a time with a recommendation (5 intent, 16 spec, 3 plan). Live curl to check what the API can give before deciding surf wind.
- **My corrections and why:**
  - Strategy pattern raised by me → moved to the plan; spec stays about business rules.
  - Today + day 8 (D-010) dropped → week starts tomorrow; "next 7 days" means planning ahead (D-016).
  - "Easy to configure for business" → one Zod config, no numbers in logic.
  - Surf wind: asked for the best the API allows instead of speed only → sea bearing from 0 m elevation points (D-020).
  - Target user made explicit: data means different things to a pro and a hobbyist (D-018). Surf numbers are not my field → all numbers flagged "Needs PO/PM review".
  - UV dropped: no real impact on sightseeing.
  - Indoor: pure inverse rewards downpours, but you still have to get to the museum → travel cap 70; safety only via Unsafe.
  - Indoor not derived from outdoor: requirements may flip → own config with `invert` + `floor` (D-021). Window 10–20 for evening visits.
  - Config comments: first too many in the values file → field docs as JSDoc in `schema.ts`, values file stays lean.
- **Agent mistakes:** Gave an indoor example (drizzle → outdoor ~30) without computing it; real value ~43 → criteria rewritten with computed inputs. Didn't log corrections during the work — caught by me; now logged as they happen.
