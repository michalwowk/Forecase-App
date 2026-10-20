# Vision

> Final after `0002-discovery`. Decisions D-009…D-015. Data facts in `docs/research/`.

## Problem
- You're planning a week in a town. Raw forecasts don't answer "when should I ski, surf, walk around, or do museums?".

## The answer we show
- Resolved place (name, region, country) + "Not this place?" with other matches.
- Week grid: 4 activities × 7 local days. Label + colour per cell, best day per row highlighted.
- Click a cell → label, score, 1–3 reasons, key values, what the data covers.
- Honest states: Not applicable, No data, Unsafe (D-011).

```
 [ Innsbruck                ] [Search]
 Innsbruck, Tyrol, Austria   · Not this place?

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
- Unknown place: "No place called X" + search again.
- Partial failure: working rows shown, failed row says "Data temporarily unavailable" (Marine → surfing, Elevation → skiing).
- Full failure (geocoding or forecast down): error + retry.

## How it works
- Web → GraphQL API → Open-Meteo. API owns scoring (`scoring.md`), web only displays.
- Per search, 4 calls in 3 rounds: Geocoding → (Elevation grid + Marine) → Forecast (town + mountain point).
- "Not this place?" re-runs the last 3 only. No database.

## Constraints (facts)
- Free Open-Meteo tier: non-commercial; attribution to Open-Meteo (CC BY 4.0) and GeoNames.
- Limits 10,000 calls/day. Multi-point counting is undocumented → elevation cache may be needed (`0005`).
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
