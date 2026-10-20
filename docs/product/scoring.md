# Scoring

How a day gets a score per activity. Set in `0004-scoring-engine`.
All numbers live in one config file. **Needs PO/PM review:** every number here is a working value from general knowledge, not expert input or data calibration.
Target user: recreational, intermediate (skier on pistes, surfer on green waves, average tourist).

## How it works
1. Days: tomorrow + 6, in the place's timezone.
2. Each activity looks only at its hour window (local, end exclusive).
3. Each metric: window hours → one value (sum / max / mean) → sub-score 0–100 by its rule, linear between "bad" and "good". `invert` flips it (100 − sub-score).
4. Score = floor + (100 − floor) × weighted sum. Floor is 0 except indoor. Deal-breakers cap it. Label: Poor 0–39 · Fair 40–59 · Good 60–79 · Great 80–100.
5. Special states first: **Not applicable** (no sea / no mountains) → **No data** (key metric < 75 % of hours; missing helper metric is dropped, weights renormalised) → **Unsafe**.
6. Reasons: caps that lowered the score first (their metric isn't repeated), then the metrics that moved the score most (either way); all neutral → the strongest one. Best day = top score, earliest on tie, none if below Fair.

## Unsafe (any window hour) — stay home
| Trigger | Threshold | Why |
|---|---|---|
| Hail storm | weather_code 96, 99 | WMO thunderstorm with hail. |
| Gusts | ≥ 100 km/h | Beaufort 11, trees break. Hurricane force (118) almost never occurs inland. |
| Heat | apparent ≥ 40 °C | Heat-index "danger" zone. |
| Cold | apparent ≤ −25 °C | Frostbite in ~30 min. |
Skiing checks the mountain point, the rest the town.

## Skiing — mountain point, 9–16, fresh snow from 16:00 day before
| Metric | Agg | Rule (0 → 100) | Weight | Why |
|---|---|---|---|---|
| Fresh snow* | sum cm | 0 → ≥ 15 | 35 % | Powder makes the day; 15 cm ≈ "powder day". |
| Snow depth* | mean cm | 10 → ≥ 80 | 25 % | No base, no skiing; 80 cm covers rocks. |
| Temperature | mean °C | ideal −8…−2; 0 at ≤ −20 / ≥ +4 | 15 % | Bitter cold vs slush. |
| Gusts | max km/h | ≥ 60 → ≤ 30 | 15 % | Lifts slow or stop from ~50–60. |
| Sunshine | sum h | 0 → ≥ 5 | 10 % | Visibility, comfort. |
Caps: depth < 10 cm → 20 "No snow base" · gusts ≥ 70 → 30 "Lifts likely closed".

## Surfing — town point (Marine + Forecast), 7–19
| Metric | Agg | Rule (0 → 100) | Weight | Why |
|---|---|---|---|---|
| Swell height* | mean m | ideal 1.0–2.0; 0 at ≤ 0.3 / ≥ 3.0 | 35 % | Flat below 0.3 m, too big for most above 3 m. |
| Swell period* | mean s | 6 → ≥ 12 | 25 % | Longer period = cleaner, stronger waves. |
| Effective wind | mean km/h | ≥ 30 → ≤ 10 | 25 % | Speed × onshore 1.0 / cross 0.7 / offshore 0.4. No sea bearing → 1.0. |
| Wind waves | mean m | ≥ 1.0 → ≤ 0.3 | 15 % | Local chop spoils waves. |
Caps: swell ≥ 3.0 m → 30 "Too big for most surfers" · swell < 0.3 m → 20 "Flat".
Sea bearing = town → centre of sea points (0 m) in the elevation grid. Weak spots: lowlands ≤ 0 m, peninsulas.

## Outdoor sightseeing — town, 10–18
| Metric | Agg | Rule (0 → 100) | Weight | Why |
|---|---|---|---|---|
| Precipitation* | sum mm | ≥ 5 → ≤ 0.2 | 35 % | Rain spoils walking most. |
| Rain chance | max % | ≥ 80 → ≤ 20 | 10 % | Uncertainty, even at 0 mm. |
| Apparent temp* | mean °C | ideal 18–24; 0 at ≤ 0 / ≥ 35 | 25 % | Felt comfort. |
| Sunshine | sum h | 0 → ≥ 5 | 20 % | Nice vs grey. |
| Gusts | max km/h | ≥ 60 → ≤ 30 | 10 % | Unpleasant from ~40. |
Caps: rain ≥ 10 mm → 25 "Heavy rain" · weather_code 95 → 30 "Thunderstorms".

## Indoor sightseeing — town, 10–20
Window: typical museum hours (~10–18) plus evening visits and the trip home. No opening-hours data.
Own config, no link to outdoor, so either can change alone. Mirrors outdoor: the worse outside, the better inside.
- Metrics, weights, thresholds: same as outdoor, each with `invert` (cold *and* heat are good for museums).
- Floor 40 (Fair): museums are always an option, even on a perfect day.
- Cap 70 (Good) on rain ≥ 10 mm, weather_code 95 or gusts ≥ 60: you still have to get there.
- Best indoor day = grey, cold or drizzly — not a downpour.

\* key metric: missing → No data.
