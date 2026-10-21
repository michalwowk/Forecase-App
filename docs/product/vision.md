# Vision

> Final after `0002-discovery`. Decisions D-009…D-015, place list D-022 (0005), web UI D-026…D-028 (0007). Data facts in `docs/research/`.

## Problem
- You're planning a week in a town. Raw forecasts don't answer "when should I ski, surf, walk around, or do museums?".

## The answer we show
- Search as you type: matches (name, region, country) in Open-Meteo order. The user picks one (D-022, D-027).
- Picked place in the URL (`?place=<id>`), so links and refresh work (D-028).
- Desktop only (D-026).
- Week grid: 4 activities × 7 local days. Label + colour per cell, best day per row highlighted.
- Click a cell → label, score, 1–3 reasons, key values, what the data covers.
- Honest states: Not applicable, No data, Unsafe (D-011).

```
 [ Inns|                              ]
 | Innsbruck, Tyrol, Austria          |
 | Innsbruck Airport, Tyrol, Austria  |

            Mon   Tue   Wed   Thu   Fri   Sat   Sun
 Skiing     Fair  Good  Great* Good  Unsafe Fair  Fair   ~2200 m nearby
 Surfing    Not applicable — no sea near Innsbruck
 Outdoor    Good  Great* Poor Fair  Unsafe Good  Good
 Indoor     Fair  Fair  Great* Good  Unsafe Fair  Fair
 * best day   Fri: Severe storm — stay home

 ▼ Wed · Skiing · Great (86)
   Fresh snow 14 cm · Light wind · Sunny afternoon
   Data for ~2200 m in the mountains nearby

 Weather data by Open-Meteo.com · Places by GeoNames
```

## States
- Empty: search box only.
- Loading: grid skeleton.
- No matches: "No place called X" in the list.
- Search down: "Search unavailable" + retry in the list.
- Unknown place in the URL: "Place not found", param removed.
- Partial failure: working rows shown, failed row says "Data temporarily unavailable" (Marine → surfing, Elevation → skiing).
- Full failure (geocoding or forecast down): error + retry.

## How it works
- Web → GraphQL API → Open-Meteo. API owns scoring (`scoring.md`), web only displays.
- Search: 1 Geocoding call. Pick a place: 4 calls in 3 rounds: Geocoding by id → (Elevation grid + Marine) → Forecast (town + mountain point).
- No database, no cache (D-023).

## Constraints (facts)
- Free Open-Meteo tier: non-commercial; attribution to Open-Meteo (CC BY 4.0) and GeoNames.
- Limits 10,000 calls/day. Multi-point counting is undocumented; risk accepted, grid cut to 25 points (D-023, D-024).
- Model data, not resort or beach data. We say "mountains nearby" and "sea near X".

## Non-goals
- Accounts, persistence, other data sources, resort or beach databases.
- i18n, unit toggle, visual polish. More than 7 days or 4 activities.

## Later
- Hourly chart in day detail.
- Skill profiles (beginner / advanced), esp. surfing (D-018).
- Daylight-based windows (`is_day`).

## Stack
- Fixed by brief: Node.js + GraphQL. Rest in `0003-repo-scaffold` (D-008).
