# Open-Meteo Forecast API (+ Air Quality, Elevation)

> AI research (Claude). Facts from Open-Meteo docs and live queries on 2026-10-19. Not reviewed by a human.

Base: `GET https://api.open-meteo.com/v1/forecast?...&forecast_days=7&timezone=auto` (https://open-meteo.com/en/docs). No API key.

## Request shape
- `forecast_days` range 0–16; `forecast_days=17` → error "Allowed range 0 to 16" (curl).
- Multiple locations: comma-separated `latitude=50.06,48.85,-33.92,39.60&longitude=...` → JSON array, one object per point (curl, 4 points). Same for Air Quality and Elevation (curl).
- Coordinates snap to the model grid: Cape Town -33.92 → -33.99; Nazaré 39.60 → 39.58 (curl).
- Unknown variable → `{"error":true,"reason":"Invalid value ..."}` (curl, e.g. `daily=is_day`, `hourly=cloud_cover_max`).

## Sightseeing variables (Kraków, Paris, Cape Town, Nazaré, curl)
| Variable | Daily | Hourly | Unit / note |
|---|---|---|---|
| precipitation_sum, precipitation_hours | yes | `precipitation` | mm, h |
| precipitation_probability_max | yes | `precipitation_probability` | % |
| temperature_2m_max/min, apparent_temperature_max | yes | `temperature_2m`, `apparent_temperature` | °C |
| wind_speed_10m_max, wind_gusts_10m_max | yes | yes | km/h |
| uv_index_max | yes | `uv_index` | index |
| sunshine_duration, daylight_duration | yes | sunshine only | seconds |
| weather_code | yes | yes | WMO code |
| cloud_cover | `cloud_cover_mean/max` (curl) | yes | % |
| is_day | no (error) | yes | 0/1 |

## Skiing variables (curl, hourly `snow_depth`, `freezing_level_height`, `snowfall`, `temperature_2m`; daily `snowfall_sum`)
| Point | elevation used | snowfall_sum week (cm) | snow_depth max (m) | temp range (°C) |
|---|---|---|---|---|
| Zakopane default | 812 | 0 | 0.00 | 0.6 … 17.8 |
| Zakopane `elevation=1987` | 1987 | 4.83 (day 6) | 0.04 | -5.5 … 9.4 |
| Zakopane `elevation=nan` | 874 (cell mean) | 0.21 | 0.00 | 0.2 … 16.9 |
| Innsbruck default | 584 | 0 | 0.00 | 3.7 … 20.0 |
| Innsbruck `elevation=2260` | 2260 | 17.18 | 0.10 | -4.4 … 8.4 |
| Innsbruck `elevation=nan` | 613 (cell mean) | 0.21 | 0.00 | 0.5 … 19.8 |
- `elevation=` changes temperature, snowfall and snow_depth (curl). Depth is model output, not resort data; near-zero is plausible mid-October. Freezing level 1190–3690 m.

## Timezone
- `timezone=auto` resolves from coords: Europe/Warsaw, Europe/Paris, Europe/Vienna (+7200), Africa/Johannesburg (+7200), Europe/Lisbon (+3600) (curl).
- One `utc_offset_seconds` per response. Kraków hourly local times on 2026-10-25 run 02:00, 03:00 with no repeat, though CEST ends that day → fixed offset across DST change (curl).

## Air Quality (https://open-meteo.com/en/docs/air-quality-api)
- Hourly `european_aqi`, `us_aqi` work for Kraków and Cape Town (curl, 2 points in one request).
- `forecast_days` max 7 (`=8` → error). AQI values non-null only ~111 of 168 h (until day 5, 14:00) (curl).
- Pollen (`birch_pollen`, `grass_pollen`): 75 h of values for Kraków, 0 for Cape Town → Europe-only, also shorter horizon (curl; docs say CAMS Europe).
- `daily=european_aqi` → error "ForecastVariableDaily"; no daily aggregates (curl).

## Elevation (https://open-meteo.com/en/docs/elevation-api)
- One value per point, 90 m Copernicus DEM (docs). Zakopane 812, Kraków 220, Innsbruck 584, Paris 46, Cape Town 24, Nazaré 19; Kasprowy Wierch 1977; near Hafelekar (47.307,11.379) 1914 (curl).
- Single point only: city-centre value says nothing about slopes 5–20 km away. "Mountains nearby" needs extra points (e.g. a ring) or another source.

## Licence (https://open-meteo.com/en/terms)
- Free API: non-commercial only (commercial → paid plan). Data CC BY 4.0: attribution required.
- Free limits: 600/min, 5,000/h, 10,000/day, 300,000/month.

## Implications for us
- All sightseeing inputs exist as daily aggregates; only `is_day` is hourly-only.
- Ski signals at town elevation are near zero; slope-height `elevation=` gives very different values.
- Multi-location requests cut call count; a 7-day forecast plus AQ is 2 calls per city.
- AQI covers ~4.5 days, not 7; pollen is Europe-only.
- Local time strings use a fixed offset; the 2026-10-25 DST switch falls inside a 7-day window.
