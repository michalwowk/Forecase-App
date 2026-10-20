Status: approved

# Intent — 0007-web-ui

## Problem
- The API answers `placeSearch` and `forecast`, but the web shows only a health check.
- A user can't search a place or see which day is best for each activity.

## Outcome
- Combobox: type → matches (name, region, country) in Open-Meteo order → the user picks one (D-022).
- Week grid: 4 activities × 7 days. Label + colour per cell, best day per row highlighted.
- Click a cell → label, score, 1–3 reasons, key values, data note ("~2200 m nearby").
- All states from `vision.md`: empty, loading (grid skeleton), no matches, row unavailable (partial failure), full failure + retry, unknown place.
- Picked place lives in the URL (`?place=…`). Refresh and shared links restore the view. Changed in spec: was `?query=…&place=…`; the combobox has no list to go back to.
- Attribution: Open-Meteo.com and GeoNames.

## Users / systems affected
- `apps/web`: new features (search, forecast), styles, MSW handlers, tests.
- `HealthStatus` leaves the page. `health` query stays in the API.
- Docs: `decisions.md`, `vision.md` (desktop only), `plan.md` (0008 merged here), README.

## Constraints
- Web only displays; scoring stays in the API. Schema unchanged (D-025).
- Tailwind CSS v4, no styled component library. Headless UI for the combobox (chosen in plan). Each package needs approval.
- Desktop only. Mobile is out of scope (known trade-off: a real app needs both).
- URL state without a router library: plain `URLSearchParams` + `history`.
- English UI (D-015). No new API calls beyond the two queries.

## Open questions
- Behaviour details (cell keyboard access, invalid `place` in URL, retry scope) → spec.
