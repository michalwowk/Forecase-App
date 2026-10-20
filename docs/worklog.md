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

## 2026-10-20 — 0004 scoring-engine (close)
- **What:** Pure `scoreWeek`: 7 days × 4 activities from hourly series. One Zod config, rules + weights in `scoring.md`, D-016…D-021, module README. 79 tests.
- **How:** One question at a time with a recommendation. Live curl before deciding surf wind. Strategy pattern per activity and per rule kind. `/simplify`, `verifier` (ready), `/code-review` (10 findings, 7 fixed).
- **Went wrong:** A Python heredoc ate backslashes in the ASCII graphs; an IDE save turned tabs into spaces — both caught by Biome/reading.
- **Cut:** real-data calibration, sum scaling on gaps, unified caps/unsafe conditions, `surfWind` under surfing — notes in `docs/plan.md` for 0005 or later.
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
- **I asked for:** easy config for business; "Needs PO/PM review" on numbers I can't judge; simple scoring docs with weights; the rest of the plan in one go instead of step-by-step stops.
- **I asked for (readability):** `/simplify` before going on, and a module README readable in under 10 minutes.
- **Dropped:** asked for a 200-city calibration run; agent flagged it was out of scope (0005) and could turn absolute scores relative (D-011) → I chose the review fixes only. Logged as an idea for 0005.
- **Walkthrough:** asked to be walked through the code step by step; had to ask twice for `scoreWeek` itself — agent jumped to helpers before explaining the flow. Found on the way: "Calm wind" at 40 km/h gusts → every reason text now shows its value.

## 2026-10-20 — 0005 graphql-api (close)
- **What:** GraphQL API: `placeSearch`, `place(id)`, `Place.forecast` (4 × 7 grid) on live Open-Meteo. Client with timeout + Zod, UTC-only calls, 5×5 terrain grid. D-022…D-024. 150 tests.
- **How:** One question at a time. Live curl before each data call (ids, UTC hours, gaps, grid sizes). Schema redesigned after the Shopify tutorial. Fixtures recorded with our own client. `verifier` (ready), `/code-review` (10 findings, 7 fixed).
- **Went wrong:** Wrong guess of a region name in a test (real fixture won). Longitude wrap added float noise to every grid → wrap only out of range. A test server stayed up on :4123 until killed by PID.
- **Cut:** cache, retries, live contract test, `node(id)`, calibration on ~200 places, sea below 0 m.
- **I corrected the agent:**
  - Auto top match + ranked "Not this place?" (D-009) → plain list in Open-Meteo order, user picks.
  - Fixed `count=10` → expose the Geocoding params (`count`, `countryCode`, `language`).
  - Proposed an Elevation cache → we had agreed not to worry about limits.
  - UTC rule in `CLAUDE.md` → it's for humans too; module README + root README.
  - REST-style schema (`week(placeId)`) → I gave it the Shopify GraphQL design tutorial first; redesigned around `Place`.
  - Kept the 100-point grid from D-012 → test app, fewer points; checked live, chose 5×5.
- **Had to ask to understand:** a recap of the UI decisions; `Node` and id options (a/b/c); how external APIs are tested (live vs mocks, versioning, Zod) → plan got a "Testing" section.
- **I asked for:** all Open-Meteo calls in UTC as a written rule; after step 3, finish without stops, take the recommended option.

## 2026-10-20 — 0006 bff-simplify (close)
- **What:** GraphQL down to `placeSearch(query)` + `forecast(placeId)`; only fields the UI shows. D-025. Layers below unchanged. 144 tests (removed-feature tests dropped, the rest moved).
- **How:** 4 intent questions, spec without grilling, plan approved with the spec ("implement right away").
- **I corrected the agent:** the 0005 schema was too big for a BFF (search params, `Node`, coordinates, nested `Place.forecast`) → take a place, do the rest underneath.
- **Didn't fit:** agent read my "tak" as option (b) (one query + alternatives); I meant to go back and chose (c) (two steps, slimmed).
