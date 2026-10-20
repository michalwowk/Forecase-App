Status: approved

# Plan — 0004-scoring-engine

## Approach
- Strategy, functional style, no classes.
  - L1 per activity: `ActivityStrategy` = source series, applicability, special metrics (fresh snow incl. overnight, effective surf wind). Registry `Record<Activity, ActivityStrategy>`.
  - L2 per metric rule: `kind` in config (`higherIsBetter` / `lowerIsBetter` / `band`, optional `invert`) → function map.
  - No pluggable combiner: one weighted sum + caps.
- Indoor = normal activity from config (invert + floor). Imports nothing from outdoor.
- Config: TS object parsed by Zod once at load. `scoreWeek(input, config = defaultConfig)` so tests override.
- No new deps. Dates: local ISO strings from API + `Date.UTC` arithmetic.

## Files (`apps/api/src/features/scoring/`)
- `scoreWeek.ts`, `types.ts` — entry and input/output types.
- `config/schema.ts`, `config/defaultConfig.ts` — Zod schema (weights sum to 1, caps, windows, floor, unsafe, labels, reason templates) + every number from `scoring.md`.
- `rules/metricRules.ts` — L2 rule functions.
- `activities/{skiing,surfing,outdoor,indoor,index}.ts` — L1 strategies.
- `pipeline/{days,windows,coverage,unsafe,score,reasons,bestDay}.ts`.
- `test/builders.ts` — hand-built hourly days. Tests next to files (`*.test.ts`).
- Docs: `decisions.md` (6 decisions from spec), `data-selection.md` (drop `cloud_cover`, `uv_index`; wind direction vs sea bearing from elevation grid), `vision.md` Later (skill profiles, `is_day` windows), `CLAUDE.md` (API uses `features/` too).

## Steps (one commit each, approval before every commit)
1. `docs(0004)`: intent, spec, plan, `scoring.md`, `decisions.md`, `data-selection.md`, `vision.md`, `CLAUDE.md`.
2. `feat(0004)`: types + config schema + default config; schema tests (weights sum, invalid kinds rejected).
3. `feat(0004)`: metric rules + tests (each kind, clamp, invert).
4. `feat(0004)`: days + windows + coverage (tomorrow + 6, end-exclusive windows, overnight snow, 75 % rule).
5. `feat(0004)`: unsafe + score (floor, weights renormalised, caps) + labels.
6. `feat(0004)`: activity strategies + `scoreWeek`; acceptance-criteria tests on hand-built days.
7. `feat(0004)`: reasons + keyValues + bestDay.
- Then verify: `pnpm test`, `typecheck`, `lint`, `verifier`, `/code-review`.

## Risks
- Hand-built numbers in acceptance criteria may not land as expected → fix test inputs, never the rule silently; real mismatch → ask.
- "No numbers in logic": scale 0–100 and neutral band 40–60 also go to config; only 0/1 indices stay in code.
- Open-Meteo keeps one UTC offset across a DST switch → window hours shift by 1 h after it. Accepted for 0004; note for 0005.
- Float noise in weighted sums → round once at the end; tests compare integers.

## Proof
- Every acceptance criterion in `spec.md` maps to a named test in `scoreWeek.test.ts` or a pipeline test.
- Config-override test: change one threshold → result changes, logic untouched.
- Verifier checks spec ↔ code, incl. grep for numeric literals in `pipeline/`, `rules/`, `activities/`.

## Divergence log
- Steps 5–7 built and committed together (owner asked to run the rest of the plan at once); `scoreWeek` needs all three, so split commits wouldn't compile.
- Strategy interface in `activities/strategy.ts` (not `index.ts`): one `series(input, config)` function per activity covers source, applicability and added fields.
- Extra pipeline files: `compare.ts` (gt/gte/lt/lte), `text.ts` (`{value}` and rounding). Pipeline unit tests in one `pipeline.test.ts`.
- Unsafe `anyHour` trigger got `decimals` (default 0) so reason formatting has no number in logic.
- Reasons: if every metric is neutral, the strongest one is still used, so a day always has 1–3 reasons.
- Code review fixes: only caps that lower the score count and give reasons; capped metric not repeated; schema checks label order, unique metric ids, floor in scale; `parseLocalTime` moved to test builders; boundary and mountain Unsafe tests.
- `/simplify` for readability: `coverage.ts` → `values.ts` (+ `sum`, `anyHourIn`); rules as a `switch`; `hourRange` as a string range; surfing split into named steps; explicit activity keys instead of `Object.fromEntries` casts; `README.md` code map in the module.
