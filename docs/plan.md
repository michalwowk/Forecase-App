# Roadmap

Status: `todo` · `doing` · `done` · `cut` (+ one-line reason). Order may change.

| # | Change | Goal | Status |
|---|---|---|---|
| 0001 | agent-workflow | Docs layout, agent rules, `/change` skill, verifier | done |
| 0002 | discovery | What we build vs what's possible: research, product vision, constraints, decisions | done |
| 0003 | repo-scaffold | Repo shape and stack, decided from discovery output | done |
| 0004 | scoring-engine | Scoring rules per activity, pure functions + tests | done |
| 0005 | graphql-api | Schema, resolvers, Open-Meteo client | done |
| 0006 | web-ui | Search a place, show ranked days per activity | todo |
| 0007 | states-and-errors | Loading, no matches, API failure, partial failure | todo |
| 0008 | readme-final | Run steps, assumptions, cuts | todo |

## Notes from 0004 (closed in 0005)
- DST: fixed. All Open-Meteo calls in UTC, local time via `Intl`.
- `sum` gaps: no nulls in live data (4 places, 8 days). Coverage rule unchanged.
- Marine vs town hours: same UTC range, aligned; tested on Nazaré.
- Idea, still not planned: sanity-check thresholds on ~200 real places. Keep scores absolute (D-011).
