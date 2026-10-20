# Open-Meteo fixtures

Real responses, recorded once by hand on **2026-10-20T17:52:13Z** (`RECORDED_AT` in `handlers/open-meteo.ts`).
Tests use that instant as "now", so the week is 2026-10-21 … 2026-10-27 and crosses the 2026-10-25 DST switch in Europe.

| Folder | Place (GeoNames id) | Shows |
|---|---|---|
| `innsbruck/` | Innsbruck, AT (2775220) | Skiing at the 2500 m cap, no sea |
| `krakow/` | Kraków, PL (3094802) | No mountains, inland marine (all null) |
| `nazare/` | Nazaré, PT (2265552) | Sea points in the grid, surfing scored |
| `zakopane/` | Zakopane, PL (3080866) | Skiing below the cap (~1700 m) |
| `search-paris.json` | `placeSearch(query: "Paris")` | Open-Meteo order |

Per place: `get.json` (Geocoding by id), `elevation.json` (5×5 grid), `marine.json`, `forecast.json` (town + mountain point). All requests in UTC.

## Re-record
- Only when Open-Meteo changes a shape (Zod fails) or the request changes.
- Run the app's own client against the live API, save each response body here, update `RECORDED_AT`.
