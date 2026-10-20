# Open-Meteo client

HTTP to Open-Meteo, nothing else. No scoring, no GraphQL. Research notes: `docs/research/open-meteo-*.md`.

## Rule: always UTC
- Every call with time data sends `timezone=GMT` and a UTC `start_hour` / `end_hour` (both included).
- Local time is computed in our code from the place's IANA timezone (`features/forecast/time/`).
- **Why:** with a local timezone Open-Meteo keeps one UTC offset for the whole response. After a DST switch inside the week, every "local" hour is off by 1 h. UTC + `Intl` is always right.

## Map
| File | Does |
|---|---|
| `client/getJson.ts` | `fetch` + timeout (`OPEN_METEO_TIMEOUT_MS`) + Zod. Any failure → `UpstreamError`. |
| `client/upstreamError.ts` | Which service failed and why (timeout, network, status, shape). |
| `client/hourly.ts` | Shared hourly response schema, UTC types. |
| `geocoding/` | Search by name (Open-Meteo order, D-022), get by id (unknown → `null`). |
| `forecast/` | Hourly forecast, several points in one call, per-point elevation. |
| `marine/` | Hourly waves at one point. Inland = all null, not an error. |
| `elevation/` | Ground height for many points in one call. |

## Errors
- Timeout, network error, HTTP error, unexpected JSON → `UpstreamError`. Callers decide what it means.
- Zod is the guard: if Open-Meteo changes a shape, we fail loudly instead of scoring garbage.
- No retries, no cache (D-023).
