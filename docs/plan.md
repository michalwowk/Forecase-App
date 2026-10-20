# Roadmap

Status: `todo` · `doing` · `done` · `cut` (+ one-line reason). Order may change.

| # | Change | Goal | Status |
|---|---|---|---|
| 0001 | agent-workflow | Docs layout, agent rules, `/change` skill, verifier | done |
| 0002 | discovery | What we build vs what's possible: research, product vision, constraints, decisions | done |
| 0003 | repo-scaffold | Repo shape and stack, decided from discovery output | done |
| 0004 | scoring-engine | Scoring rules per activity, pure functions + tests | done |
| 0005 | graphql-api | Schema, resolvers, Open-Meteo client | doing |
| 0006 | web-ui | Search a place, show ranked days per activity | todo |
| 0007 | states-and-errors | Loading, no matches, API failure, partial failure | todo |
| 0008 | readme-final | Run steps, assumptions, cuts | todo |

## Notes for 0005 (from 0004)
- Open-Meteo keeps one UTC offset across a DST switch → window hours shift by 1 h after it. Check and decide.
- `sum` metrics skip missing hours: 2 of 8 rainy hours missing can read ~1 mm instead of ~8 mm. Look at real gaps, then decide (scale up or stricter coverage).
- Marine with values but no hours matching the town → surfing shows "No data", not "Not applicable".
- Idea, not planned: sanity-check thresholds on ~200 real places. Keep scores absolute (D-011).
