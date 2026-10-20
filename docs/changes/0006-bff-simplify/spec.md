Status: approved

# Spec — 0006-bff-simplify

## Requirements
- GraphQL exposes only what the UI shows (D-025). Constants (10 results, `en`) live in the API.
- Two steps stay (D-022): `placeSearch` → user picks → `forecast(placeId)`.
- Below GraphQL nothing changes: Open-Meteo client, terrain, time, scoring, fixtures.

## Interface
```graphql
type Query {
  health: Health!
  placeSearch(query: String!): [Place!]!   # Open-Meteo order, 10, en
  forecast(placeId: ID!): Forecast         # unknown id → null
}
type Place { id: ID!, name: String!, region: String, country: String }
type Forecast { place: Place!, activities: [ActivityForecast!]! }
type ActivityForecast {
  activity: Activity!
  available: Boolean!                      # false → days [], bestDay null
  dataElevation: Int                       # skiing only
  bestDay: Date
  days: [DayForecast!]!
}
type DayForecast {
  date: Date!, state: DayState!, score: Int, label: Label
  reasons: [String!]!, keyValues: [KeyValue!]!
}
type KeyValue { label: String!, value: Float!, unit: String! }
scalar Date
enum Activity / DayState / Label        # unchanged
```

## Behaviour
| Case | Result |
|---|---|
| Blank `query` | `BAD_USER_INPUT` |
| No matches | `[]` |
| Unknown or non-canonical `placeId` | `null` |
| Geocoding or Forecast down | `UPSTREAM_UNAVAILABLE`, field `null` |
| Marine / Elevation down | that row `available: false` |
- `forecast` fetches the place by id, then the week (same calls as 0005).
- Removed: `place(id)`, `Place.forecast`, `Node`, search args, coordinates, timezone, countryCode, `WeekForecast.days`, `keyValues.metric`, `bestDay` object, forecast budget.

## Out of scope
- Changes below the GraphQL layer. Web UI (0007).

## Acceptance criteria
- [x] `schema.graphql` matches the interface above; removed fields are gone.
- [x] `placeSearch` sends `count=10`, `language=en`, no `countryCode`; keeps Open-Meteo order.
- [x] Every row of the behaviour table has a test.
- [x] Fixture tests from 0005 (4 places, UTC/DST requests, failures) pass on the new shape.
- [x] D-025 in `decisions.md` (partly supersedes D-022); README and vision match.
- [x] `pnpm test`, `pnpm typecheck`, `pnpm lint` pass.
