Status: approved

# Intent — 0004-scoring-engine

## Problem
- We fetch nothing and score nothing yet. The core of the product — "which day is best for X" — doesn't exist.
- Scoring rules are TBD in `docs/product/scoring.md`. D-010…D-013 set the frame, not the numbers.

## Outcome
- Pure functions turn hourly series (timestamps, place timezone, "now") into a 7-day result per activity.
- They cut data into local days and per-activity hour windows, skip past hours today, add day 8 when today is closed (D-010).
- Per day and activity: `state` (scored / notApplicable / noData / unsafe), `score` 0–100, `label`, 1–3 English `reasons`, `keyValues`. Per week: `bestDay` per activity.
- `scoring.md` explains how it works, simply, with weights and thresholds per activity, each with a "why".
- Unit tests on hand-built typical days prove every rule (ideal ski day → Great, rainy 3 °C → Poor).

## Users / systems affected
- `apps/api` only: new scoring module + tests.
- `docs/product/scoring.md`, `decisions.md`.

## Constraints
- Every number (thresholds, weights, windows, Unsafe limits) lives in one typed, Zod-validated config file. No magic numbers in logic. Business changes a value = edit one file + PR.
- Tests read the config; changing a number doesn't mean rewriting tests.
- Numbers proposed by the agent with a "why", approved by the human in spec.
- No HTTP, no GraphQL schema change, no Open-Meteo client. "Not applicable" (no sea, no mountains) comes in as an input fact.
- Out: mountain point selection from the elevation grid, real-data fixtures and calibration (→ `0005`).

## Open questions
- Exact windows, metrics, weights, thresholds, Unsafe limits, label bands → spec.
- Combining rule (weighted sum vs deal-breakers), "No data" threshold for gaps, best-day tie-break → spec.
