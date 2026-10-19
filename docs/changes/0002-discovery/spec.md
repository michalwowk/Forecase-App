Status: approved

# Spec — 0002-discovery

## Requirements
- Research Open-Meteo with docs + live curl queries. Pick the fields we use per activity.
- Competitor note: Windy, Surfline, OnTheSnow or Snow-Forecast, Google/Apple Weather. Public pages only.
- Product + UI session after research: one question at a time, with data context.
- Decide 9 product questions: 5 open in `vision.md` + units, "today" as day 1, missing data, hours that count.
- Decide UI: screens and flow, results layout, day detail, requests per search.

## Behaviour
- Live queries for 6 places: Zakopane, Nazaré, Kraków, Paris (FR vs TX), Innsbruck, Cape Town.
- Deep: Geocoding, Forecast (incl. `elevation`), Marine. Short check: Air quality, Elevation.
- Every fact links its source URL or the curl query used.
- Known edge cases to document: marine inland → HTTP 200 + nulls; geocoding ranking undocumented; marine horizon unclear; pollen Europe-only, 4 days; DST ignored in `utc_offset_seconds`.
- Licence facts recorded as constraints: non-commercial free tier, CC BY 4.0 + GeoNames attribution, rate limits.

## Interface (files)
- `docs/research/open-meteo-geocoding.md`, `open-meteo-forecast.md`, `open-meteo-marine.md`, `competitors.md`, `data-selection.md`.
- Each note starts with: "AI research (Claude). Facts from Open-Meteo docs and live queries on YYYY-MM-DD. Not reviewed by a human."
- `docs/product/decisions.md`: product and UI decisions only.
- `docs/product/vision.md`: final. Open questions empty. ASCII screen sketch + states (loading, unknown place, pick a place, API error).

## Out of scope
- Other weather sources, paid APIs, historical/climate data, lift/slope status.
- UI prototype or code. Scripts are not committed.
- Weights, thresholds, metric math → `0004`.
- Stack choice → `0003`.

## Acceptance criteria
- [ ] 5 research notes exist, each ≤ ~60 lines, each with the AI banner.
- [ ] `data-selection.md` maps every activity to named Open-Meteo fields with a "why".
- [ ] Every edge case in Behaviour is covered in a note, with source or query.
- [ ] All 9 product questions decided and logged in `decisions.md`.
- [ ] `vision.md` has no open questions and includes the ASCII sketch, states and requests per search.
