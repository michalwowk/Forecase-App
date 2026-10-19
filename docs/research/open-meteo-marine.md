# Open-Meteo Marine API (surfing)

> AI research (Claude). Facts from Open-Meteo docs and live queries on 2026-10-19. Not reviewed by a human.

Endpoint: `https://marine-api.open-meteo.com/v1/marine`. Docs: https://open-meteo.com/en/docs/marine-weather-api ("docs" below).
Live queries ("curl" below): `?latitude=..&longitude=..&hourly=..&daily=..&timezone=auto&forecast_days=7|16`.

## Variables
- Hourly: `wave_height`, `wave_period`, `wave_peak_period`, `wave_direction`, `swell_wave_height|period|direction`, `wind_wave_height`, `sea_surface_temperature` (docs).
- Daily: `wave_height_max`, `wind_wave_height_max`, `swell_wave_height_max`, `wave_period_max`, `swell_wave_period_max`, `*_direction_dominant`. Simple 24 h aggregation of hourly (docs).
- `wave_peak_period_max` does not exist. Request fails with HTTP 400 (curl). Only `wind_wave_peak_period_max` / `swell_wave_peak_period_max` are listed (docs).
- Hourly `wave_peak_period` was null for all 168 h at Nazaré, Cape Town, Muizenberg (curl, default model).
- `timezone=auto` resolved correctly: Europe/Lisbon, Africa/Johannesburg, Europe/Paris, Europe/Warsaw (curl).

## Forecast horizon
- Docs contradict themselves: `forecast_days` "Integer (0-8)", default "5", text "Per default, 7 days are returned. Up to 8 days" (docs).
- No `forecast_days`: 7 days returned (curl Nazaré).
- `forecast_days=16`: HTTP 200, 16 days. `=17`: HTTP 400 "Allowed range 0 to 16" (curl).
- With 16 days, only 9 daily values non-null (2026-10-19..27). Hourly non-null until 2026-10-28 ~01:00 local (curl, all coastal points).
- `forecast_days=7`: all 7 days, all 168 hours non-null at coastal points (curl).
- Models: MeteoFrance MFWAM 0.08° 10 d; ECMWF WAM 9 km 15 d; GFS Wave 0.16–0.25° 16 d; DWD EWAM (Europe) 0.05° 8 d (docs, Data Sources).

## Resolution and accuracy
- Headline "5 km resolution"; models range 0.05° (~5 km) to 0.25° (~25 km) (docs).
- "Accuracy at coastal areas is limited. This is not suitable for coastal navigation" (docs, currents/tides note).
- Returned lat/lon is the grid-cell centre and "might be a few kilometres away" (docs).

## Inland points
| Place | Requested | Returned cell | Distance | Data |
|---|---|---|---|---|
| Paris | 48.85, 2.35 | 48.875, 2.375 | 3.3 km | all null |
| Kraków | 50.06, 19.94 | 50.042, 19.958 | 2.4 km | all null |
| Zakopane | 49.30, 19.95 | 49.292, 19.958 | 1.1 km | all null |
- HTTP 200, `time` array filled, every value `null` incl. SST (curl, 7 and 16 days).
- `cell_selection=sea` (docs default) and `=nearest`: Paris and Kraków return the same cell and all nulls. No snap to the Channel or Baltic (curl).

## City centre vs beach
| Point | Returned cell | Dist. | Day-1 wave max | Day-1 swell period | SST 12:00 |
|---|---|---|---|---|---|
| Nazaré town 39.60,-9.07 | 39.708,-9.125 | 12.9 km | 1.66 m | 13.5 s | 16.2 °C |
| Praia do Norte 39.605,-9.085 | 39.708,-9.125 | 12.0 km | 1.66 m | 13.5 s | 16.2 °C |
| Cape Town centre -33.92,18.42 | -33.958,18.292 | 12.6 km | 2.42 m | 8.9 s | 15.6 °C |
| Muizenberg -34.11,18.47 | -34.125,18.458 | 2.0 km | 1.86 m | 9.2 s | 16.5 °C |
- Nazaré: town and beach map to the same offshore cell. Values identical (curl).
- Cape Town: centre maps to the Atlantic side, Muizenberg to False Bay. Values differ ~20–30 % on wave height (curl).
- Coastal points can snap 12+ km offshore; inland points snap only a few km (curl).

## Wind
- Not in Marine API. Offshore/onshore wind would come from the Forecast API (`wind_speed_10m`, `wind_direction_10m`).

## Implications for us
- "No coast" is visible as HTTP 200 with every wave value `null`. HTTP status alone does not detect it.
- Distance requested→returned cell is not a reliable coast signal: inland cells were 1–3 km away, coastal cells up to 13 km.
- `cell_selection=sea` does not search far. A city ~100+ km from the sea gets nulls, not the nearest coast.
- 7 days of full wave data are available. Beyond ~9 days the tail is null.
- One city coordinate can hit a different water body than the surf beach (Cape Town). Beach-level coordinates change the result.
