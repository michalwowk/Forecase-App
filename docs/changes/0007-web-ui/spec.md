Status: approved

# Spec — 0007-web-ui

## Requirements
- Combobox search → pick a place → week grid → day detail. Desktop only (D-026).
- Two queries only: `placeSearch(query)`, `forecast(placeId)`. Detail uses data already loaded.
- Picked place in the URL (D-028). Every state from `vision.md` handled. Tailwind v4.

## Behaviour
- **Combobox (D-027):** input trimmed; < 2 chars → no request, no list. 300 ms after the last keystroke → `placeSearch`.
  - List: "Name, Region, Country" (missing parts skipped), Open-Meteo order. One match is still a list (D-022).
  - Keys: ↑/↓ move, Enter picks, Esc closes. Click outside closes. WAI-ARIA combobox roles.
  - In the list: "Searching…", "No place called X", "Search unavailable" + Retry.
  - Pick → input shows the place, list closes, `pushState(?place=<id>)`. Typing again doesn't drop the current grid.
- **URL:** load and back/forward read `?place`. None → empty state. Input text comes from `forecast.place`.
- **Forecast:** loading → 4×7 grid skeleton. API error → "Forecast unavailable" + Retry. `null` → "Place not found", `place` removed with `replaceState`.
- **Grid:** rows Skiing, Surfing, Outdoor, Indoor. Columns: `Wed 21` from `date` (no timezone shift).
  - Scored cell: label word + colour (never colour alone). Unsafe / No data: own look + word.
  - Best day per row marked (icon + text for screen readers). `bestDay` null → no mark.
  - All 7 days Not applicable → one row-wide cell with the reason. `available: false` → "Data temporarily unavailable".
  - Skiing row shows "~2200 m nearby" when `dataElevation` is set.
- **Detail:** cells are buttons. Click → panel under the grid: "Wed 21 Oct · Skiing · Great (86)", reasons, key values (`label value unit`), skiing data height. Unscored: state word + reasons, no score. Same cell again → closes. New place → cleared.
- TanStack Query defaults (3 retries with backoff, ~7 s before an error shows). Retry button after that. Footer: Open-Meteo.com, GeoNames links.

## Interface
- URL: `/` (empty) · `/?place=2775220`.
- States: empty · searching · matches · no matches · search error · forecast loading · grid · forecast error · place not found · row unavailable.
- `HealthStatus` removed from the page.

## Out of scope
- Mobile layout (D-026). i18n, dark mode, hourly chart, full a11y audit.
- Places with 1-letter names (Å, Y) can't be found (D-027).

## Acceptance criteria
- [ ] < 2 trimmed chars → no request; ≥ 2 → one request after 300 ms (fake timers).
- [ ] Combobox: keyboard pick, Esc, no matches, search error + retry.
- [ ] Pick → `?place=<id>` pushed; load with `?place` shows the grid; back/forward switch places.
- [ ] Grid: labels, best day mark, Unsafe, No data, Not applicable row, unavailable row, skiing height.
- [ ] Detail opens, closes, clears on new place; shows reasons and key values.
- [ ] Forecast loading skeleton, error + retry, unknown place → message + `place` removed.
- [ ] D-026…D-028 in `decisions.md`; D-014 mobile part superseded; `vision.md`, README, `docs/plan.md` (0008 cut) match.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` pass.
