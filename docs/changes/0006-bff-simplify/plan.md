Status: approved

# Plan — 0006-bff-simplify

Approved together with the spec ("implement right away").

## Files
- `apps/api/schema.graphql` — new interface from spec.
- `apps/api/codegen.ts` — keep `Place` mapper (Geocoding place).
- `src/features/places/resolvers/placeResolvers.ts` — `placeSearch(query)` with constants; `Place` fields; drop `place`, `Node`.
- `src/features/forecast/resolvers/forecastResolvers.ts` — `Query.forecast(placeId)`: id check → `getPlace` → `placeForecast` → map.
- `src/context/graphqlContext.ts`, `src/server.ts`, `src/schema.ts` — drop the forecast budget, wire new resolvers.
- Tests: `placeResolvers.test.ts`, `forecastResolvers.test.ts` moved to the new shape.
- Docs: D-025, `README.md`, `vision.md` (only if they name removed fields).

## Steps
1. Schema + resolvers + context, one commit with tests.
2. Docs + close.

## Risks
- Codegen types change → `pnpm typecheck` catches every stale use.

## Proof
- Spec acceptance criteria; `pnpm test`, `pnpm typecheck`, `pnpm lint`.

## Divergence log
- Code review: forecast budget kept (aliases can ask for many forecasts); `parsePlaceId` moved to `openMeteo/geocoding`; days mapped field by field.
- Roadmap renumbered (web-ui 0007, states 0008, readme 0009). Older change docs keep their original numbers.
