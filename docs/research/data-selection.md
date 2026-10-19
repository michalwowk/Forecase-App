# Data selection

> AI research (Claude). Facts from Open-Meteo docs and live queries on 2026-10-19. Not reviewed by a human.

Which Open-Meteo fields we take per activity, and why. Sources: the four notes next to this file.
All weather fields are **hourly**: each activity is scored on its own hour window (D-010).
Windows, weights and thresholds → `scoring.md` in `0004`.

## Place (Geocoding)
- `name`, `country`, `admin1` — show which place we resolved (D-009).
- `latitude`, `longitude`, `timezone` — feed every other call.
- `population`, `feature_code` — rank/filter matches (airports, capes appear).

## Terrain (Elevation API)
- 100-point grid (~40×40 km) in one call. Highest point, capped to a ski range, is the "mountain point" (D-012).
- No clearly higher terrain than the town → skiing "Not applicable".

## Skiing (Forecast, hourly at the mountain point)
| Field | Why |
|---|---|
| `snowfall` | Fresh snow, incl. overnight before the window. |
| `snow_depth` | Base exists or not. Model data, not resort data. |
| `temperature_2m` | Slush / rain-on-snow when warm. |
| `wind_gusts_10m` | Lifts close in strong wind. |
| `sunshine_duration` | Visibility on the slope. |
- Town height gives ~0 snow; mountain point gives real values (Zakopane 0 vs 4.8 cm, Innsbruck 0 vs 17.2 cm).

## Surfing (Marine + Forecast, hourly at the town point)
| Field | Why |
|---|---|
| `swell_wave_height` | Rideable energy. |
| `swell_wave_period` | Longer period = better waves. |
| `wind_wave_height` | Local chop lowers quality. |
| Forecast `wind_speed_10m`, `wind_direction_10m` | Offshore vs onshore wind. |
- Skip `wave_peak_period` (always null). All-null marine response = no sea → "Not applicable".

## Outdoor sightseeing (Forecast, hourly at the town point)
| Field | Why |
|---|---|
| `precipitation`, `precipitation_probability` | Rain is the main downer. |
| `apparent_temperature` | Felt comfort, not raw temperature. |
| `wind_gusts_10m` | Unpleasant, and part of the Unsafe check (D-011). |
| `sunshine_duration`, `cloud_cover` | Nice vs grey day. |
| `uv_index` | Midday UV risk. |
| `weather_code` | Reason text; hail storm (96/99) → Unsafe. |

## Indoor sightseeing
- No own fields. Complement of the outdoor score, floor at Fair, Unsafe carries over (D-013).

## Left out
- Air quality: ~4.5 days of values, no daily aggregate, pollen Europe-only. Can't cover 7 days.
- Daily aggregates: whole-day values ignore the hour window (D-010).

## Requests per search
- 4 calls in 3 rounds: Geocoding → (Elevation + Marine) → Forecast (town + mountain point).
- Free limit 10,000 calls/day. Counting of multi-point requests is undocumented: ~2,000 searches/day if a grid is 1 call, ~95 if each point counts. Elevation cache is the fix (`0005`).
