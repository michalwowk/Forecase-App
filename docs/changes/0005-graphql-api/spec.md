Status: approved

# Spec — 0005-graphql-api

Schema design follows the Shopify GraphQL design tutorial (domain objects, object refs, nullable where a field can fail).

## Requirements
- `placeSearch` returns Geocoding matches in Open-Meteo order. No filter, no sort. User always picks (supersedes D-009).
- `place(id)` resolves one place. `Place.forecast` is computed only when queried.
- Forecast = 0004 `scoreWeek` on live data. API owns all scoring; web only displays.
- All Open-Meteo calls in UTC (`timezone=GMT`, `start_hour`/`end_hour`). Local time computed by us from the IANA timezone.
- No cache (MVP, limit risk accepted). Timeout `OPEN_METEO_TIMEOUT_MS` (env, default 5000). No retry.

## Behaviour
- **Calls per forecast:** `get?id` → (Elevation 5×5 grid + Marine) → Forecast (town + mountain point in one request).
- **Hour range:** local 16:00 of today (ski fresh snow) to local end of day +7, converted to UTC. Series times converted UTC → local before scoring. DST: a repeated hour counts twice, a skipped hour is missing.
- **Today:** local date of the place from the server clock.
- **Mountain point:** grid ±20 km around town. Highest point, capped at 2500 m. Not applicable if max < 1000 m or max < town + 500 m. Town height = Geocoding `elevation`; missing or `-9999` → nearest grid point. Numbers in the scoring config.
- **Sea bearing:** town → centre of grid points at 0 m (D-020). None → `null`.
- **Surfing not applicable:** Marine all-null. Marine with values but no hours matching the week → test proves it is not "No data" by mistake.
- **`sum` gaps:** live check (4 places, 8 days) found no nulls. Coverage rule unchanged.

## Interface
```graphql
type Query {
  placeSearch(query: String!, first: Int = 10, countryCode: String, language: String = "en"): [Place!]!
  place(id: ID!): Place
}
interface Node { id: ID! }
type Place implements Node {
  id: ID!                          # GeoNames id, e.g. "2775220"
  name: String!
  region: String                   # admin1
  country: String
  countryCode: String
  coordinates: Coordinates!
  timezone: String!                # IANA
  forecast: WeekForecast           # null + error on upstream failure
}
type Coordinates { latitude: Float!, longitude: Float! }
scalar Date                        # local date, YYYY-MM-DD
type WeekForecast { days: [Date!]!, activities: [ActivityForecast!]! }
type ActivityForecast {
  activity: Activity!
  available: Boolean!              # false → [] days, null bestDay
  days: [DayForecast!]!
  bestDay: DayForecast
  dataElevation: Int               # skiing only, metres
}
type DayForecast {
  date: Date!, state: DayState!, score: Int, label: Label
  reasons: [String!]!, keyValues: [KeyValue!]!
}
type KeyValue { metric: String!, label: String!, value: Float!, unit: String! }
enum Activity { SKIING SURFING OUTDOOR INDOOR }
enum DayState { SCORED NOT_APPLICABLE NO_DATA UNSAFE }
enum Label { POOR FAIR GOOD GREAT }
```

## Errors
| Case | Result |
|---|---|
| No matches | `[]` |
| Unknown or non-numeric `place` id (Open-Meteo 400 "not found") | `null` |
| `first` ∉ 1–100, blank `query`, `countryCode` not 2 letters | `BAD_USER_INPUT` |
| Geocoding down | `UPSTREAM_UNAVAILABLE`, field `null` |
| Forecast down | `UPSTREAM_UNAVAILABLE` at `place.forecast` |
| Marine down | `SURFING.available = false` |
| Elevation down | `SKIING.available = false`, sea bearing `null` |
- Down = timeout, network error, 5xx, or any other 4xx. Other errors masked in production.

## Out of scope
- Cache, retries, rate limiting. Calibration on ~200 places. `node(id)` and global ids (add with a 2nd Node type).
- Web UI (0006), UI states (0007). i18n: `language` changes place names only (D-015).

## Acceptance criteria
- [ ] `placeSearch(query: "Paris")` returns Open-Meteo order; `first`, `countryCode`, `language` reach the request.
- [ ] Invalid args → `BAD_USER_INPUT`; no results → `[]`; unknown id → `null`.
- [ ] Every Open-Meteo request has `timezone=GMT`; a DST week (fixture across 2026-10-25) keeps windows on local hours.
- [ ] Recorded fixtures: Innsbruck skiing scored with `dataElevation` ≤ 2500; Kraków skiing and surfing `NOT_APPLICABLE`; Nazaré surfing scored; Zakopane skiing applicable.
- [ ] Each failure row in the table has a test (MSW), incl. timeout.
- [ ] Terrain numbers in config + `scoring.md` ("Needs PO/PM review"); D-022 (place list), D-023 (no cache) in `decisions.md`.
- [ ] UTC rule in the Open-Meteo module README + root `README.md` Assumptions; `vision.md` and `plan.md` (0007 row) updated.
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` pass.
