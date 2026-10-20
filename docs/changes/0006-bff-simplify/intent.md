Status: approved

# Intent — 0006-bff-simplify

## Problem
- The 0005 GraphQL API is too big for a BFF: Open-Meteo search params, `Node`, coordinates, timezone, nested `Place.forecast`, ids the UI never shows.
- The web (0007) should only ask for what it shows. Everything else belongs to the backend.

## Outcome
- Two steps stay (D-022): search → the user picks a place → forecast.
- `placeSearch(query)` → list of places (id, name, region, country). 10 results, English, Open-Meteo order — constants in the API.
- `forecast(placeId)` → place + 4 activity rows (activity, available, dataElevation, bestDay date, days). Unknown id → `null`.
- Day: date, state, score, label, reasons, keyValues (label, value, unit).
- Removed: search args, `Node`, `place(id)`, `Place.forecast`, coordinates, timezone, countryCode, `WeekForecast.days`, `keyValues.metric`, `bestDay` as an object, 1-forecast-per-request budget.

## Users / systems affected
- `apps/api`: `schema.graphql`, resolvers, GraphQL tests. Open-Meteo client, terrain, time, scoring unchanged.
- Docs: D-025 in `decisions.md`, `vision.md` if needed, root `README.md`.

## Constraints
- Errors as in 0005: blank query → `BAD_USER_INPUT`; Open-Meteo down → `UPSTREAM_UNAVAILABLE`; Marine/Elevation down → row `available: false`.
- D-025: the API exposes only what the UI needs; constants live in the backend. Known trade-off: a bigger app would need to widen and rethink it.
- Same fixtures and fixed clock; no test weakened — tests move to the new shape.

## Open questions
- None from intent. Field-level details → spec.
