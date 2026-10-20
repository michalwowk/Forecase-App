Status: approved

# Intent — 0005-graphql-api

## Problem
- Scoring exists (0004), but nothing feeds it. No Open-Meteo client, no GraphQL query beyond `health`.
- The web has no contract to build against in 0006 / 0007.

## Outcome
- `places(name, count, countryCode, language)` returns Geocoding matches as-is, in Open-Meteo order. No filter, no sort. Defaults as in Open-Meteo (`count` 10, `language` en).
- The user always picks a place from the list, even when there is one match. Supersedes D-009 ("Not this place?" goes away).
- `week(placeId)` resolves the place by id, fetches Elevation, Marine, Forecast, runs scoring, returns the 4 × 7 grid.
- The schema models every state now: unknown place, partial failure per row ("Data temporarily unavailable"), full failure as a GraphQL error. 0007 only builds the UI for them.
- 0004 notes closed: DST fixed, `sum` gaps checked on real data, marine without matching hours tested.

## Users / systems affected
- `apps/api`: schema, resolvers, new Open-Meteo client feature, MSW handlers, fixtures.
- Docs: `decisions.md` (D-022 place list, D-023 no cache), `vision.md`, `plan.md` (0007 row), root `README.md`.

## Constraints
- All Open-Meteo calls in UTC (`timezone=GMT`). Local time is computed in our code from the IANA timezone. Written in the client module README + one line in root `README.md` Assumptions.
- Our API returns local calendar dates (D-010, D-016). Scoring code stays as is; conversion happens before it.
- No cache, by choice (MVP). Daily-limit risk accepted.
- `language` changes place names only. UI stays English (D-015).
- Tests: recorded real responses (Zakopane, Innsbruck, Nazaré, Kraków) via MSW + sanity checks. No calibration on ~200 places.

## Open questions
- Exact schema shapes and error codes → spec.
- Mountain point and sea bearing from the elevation grid (D-012, D-020): exact rules → spec.
- What to do if real data shows `sum` gaps → spec, after looking at the data.
