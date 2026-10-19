# Data selection

> AI research (Claude). Facts from Open-Meteo docs and live queries on 2026-10-19. Not reviewed by a human.

Which Open-Meteo fields we take per activity, and why. Sources: the four notes next to this file.
Weights and thresholds are not here → `scoring.md` in `0004`.

## Place (Geocoding)
- `name`, `country`, `admin1` — show the user which place we resolved (`open-meteo-geocoding.md`).
- `latitude`, `longitude`, `timezone` — feed every other call.
- `population`, `feature_code` — rank/filter ambiguous matches (airports, capes appear).
- `elevation` — town height; context for skiing only.

## Skiing (Forecast, daily unless noted)
| Field | Why |
|---|---|
| `snowfall_sum` | Fresh snow is the main "good day" signal. |
| hourly `snow_depth` (daily max) | Base exists or not. Model data, not resort data. |
| `temperature_2m_max` | Rain-on-snow / slush when warm. |
| `wind_gusts_10m_max` | Lifts close in strong wind. |
| `sunshine_duration` | Visibility on the slope. |
- Town elevation gives ~0 snow; slope `elevation=` gives real values (Zakopane 0 vs 4.8 cm, Innsbruck 0 vs 17.2 cm). Which elevation we query is open (`open-meteo-forecast.md`).

## Surfing (Marine + Forecast)
| Field | Why |
|---|---|
| `swell_wave_height_max` | Rideable energy. |
| `swell_wave_period_max` | Longer period = better waves. |
| `wind_wave_height_max` | Local chop lowers quality. |
| Forecast `wind_speed_10m_max`, `wind_direction_10m_dominant` | Offshore vs onshore wind. |
- Skip `wave_peak_period` (always null) and daily `wave_peak_period_max` (HTTP 400) (`open-meteo-marine.md`).
- All-null response = no coast. HTTP status doesn't show it.

## Outdoor sightseeing (Forecast, daily)
| Field | Why |
|---|---|
| `precipitation_sum`, `precipitation_probability_max`, `precipitation_hours` | Rain is the main deal-breaker. |
| `apparent_temperature_max` | Felt comfort, not raw temperature. |
| `wind_gusts_10m_max` | Unpleasant above some level. |
| `sunshine_duration`, `cloud_cover_mean` | Nice vs grey day. |
| `uv_index_max` | Midday heat/UV risk. |
| `weather_code` | One label for the reason text (storm, fog, snow). |

## Indoor sightseeing (Forecast, daily)
- Same fields as outdoor. Inverse use: bad outdoor day → good indoor day. Exact rule is open.

## Left out
- Air quality: ~4.5 days of values, no daily aggregate, pollen Europe-only. Can't cover 7 days.
- Elevation API: one point can't detect nearby mountains.
- Hourly-only data (`is_day`): daily aggregates cover our needs.

## Requests per search (minimum)
- 1 geocoding + 1 forecast (multi-point allowed: town + slope in one call) + 1 marine = **3 calls**.
- Free limit 10,000/day → ~3,300 searches/day without cache.
