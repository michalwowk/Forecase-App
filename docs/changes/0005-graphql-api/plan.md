Status: approved

# Plan — 0005-graphql-api

## Choices
- Native `fetch` + `AbortSignal.timeout`, Zod for every response. No new deps.
- `UpstreamError` in the client; resolvers map it to `GraphQLError` (`extensions.code`).
- Clock in GraphQL context: `createApp({ now })`, default `() => new Date()`.
- Fixtures recorded once by hand (curl), no record script. Recording time kept in fixture README.

## Testing
- Open-Meteo is versioned (`/v1/`). Zod guards production: bad shape → `UPSTREAM_UNAVAILABLE`.
- Our BFF tests never hit the network: MSW only, fixed `now`.
- Happy paths: real responses recorded once as JSON fixtures (shape + realistic values, incl. the 2026-10-25 DST week).
- Failures: hand-written MSW handlers (5xx, timeout, bad shape, 400 "not found").
- No live contract test (overkill for a test app).

## Files
- `apps/api/schema.graphql` — schema from spec (keep `health`).
- `apps/api/codegen.ts` — `scalars: { Date: string }`, mapper `Place` → internal place (keeps Geocoding `elevation`).
- `src/env.ts` (+ test) — `OPEN_METEO_TIMEOUT_MS`, default 5000.
- `src/server.ts`, `src/schema.ts` — context with `now`; resolvers merged from features.
- `src/features/openMeteo/client/` — `getJson(url, schema)`: timeout, `!ok` → `UpstreamError`, Zod parse.
- `src/features/openMeteo/{geocoding,forecast,marine,elevation}/` — request builder (always `timezone=GMT`) + response schema.
- `src/features/openMeteo/README.md` — UTC rule and why.
- `src/features/places/resolvers/` — `placeSearch` (arg validation), `place` (400 "not found" → `null`).
- `src/features/forecast/time/` — local today, UTC hour range, UTC → local strings (`Intl`).
- `src/features/forecast/terrain/` — 5×5 grid, mountain point, sea bearing.
- `src/features/forecast/resolvers/` — `Place.forecast`: calls, partial failures, `scoreWeek`, map to GraphQL.
- `src/features/scoring/config/{schema,defaultConfig}.ts` — `terrain` section (grid, cap, thresholds).
- `src/mocks/handlers/open-meteo.ts`, `src/mocks/fixtures/open-meteo/` — 4 places, Paris search, README.
- Docs: `decisions.md` (D-022, D-023, D-024), `scoring.md`, `vision.md`, `plan.md`, root `README.md`.

## Steps (one commit each)
1. Docs: D-022 place list (supersedes D-009), D-023 no cache, D-024 terrain numbers; `vision.md`, `plan.md` 0007 row.
2. Client + endpoint schemas + env + module README; unit tests (timeout, 5xx, bad shape, `timezone=GMT`).
3. Time + terrain pure functions with unit tests (DST week, grid, cap, not applicable, bearing).
4. Record fixtures, MSW handlers.
5. Schema + codegen + `places` resolvers; HTTP tests for search and errors.
6. `Place.forecast` resolver; fixture tests (4 places) and failure table tests.
7. `scoring.md` terrain section, root `README.md` Assumptions.

## Risks
- Open-Meteo changes shape in production → Zod fails loudly (`UPSTREAM_UNAVAILABLE`); re-record fixtures by hand, fix schemas.
- Fixed `now` must match fixture dates → one constant per place in the fixture README and tests.
- Grid misses peaks (5×5) → accepted weak spot, noted in `scoring.md`.
- Mapper types drift from schema → `pnpm typecheck` runs codegen first.

## Proof
- Acceptance criteria in `spec.md`, each mapped to a test or doc check.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`. Manual query in GraphiQL (`pnpm dev`) for one live place.

## Divergence log
- Step 4: orchestration (`forecast/service/placeForecast.ts`) and `forecast/fields.ts` written before the fixtures: recording ran our own client + orchestration from a throwaway script, so requests match production. Resolver in step 6 only maps it to GraphQL.
- `ForecastPoint.elevation` nullable → `nan` (model cell height) when the town height is unknown and the grid failed.
