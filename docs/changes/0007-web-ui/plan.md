Status: approved

# Plan — 0007-web-ui

Paths under `apps/web/` unless noted.

## Files
- Tooling: `package.json` (+ `tailwindcss`, `@tailwindcss/vite`, `@headlessui/react`), `vite.config.ts`, `src/index.css`, `src/main.tsx`, `codegen.ts` (`Date` → `string`).
- Shared: `src/hooks/useDebouncedValue.ts`, `src/hooks/usePlaceParam.ts` (read `?place`, push/replace, `popstate`), `src/utils/dates.ts` (`Wed 21`, `Wed 21 Oct`, UTC).
- `src/features/places/`: `hooks/usePlaceSearch.ts`, `components/PlaceCombobox.tsx`.
- `src/features/forecast/`: `hooks/useForecast.ts`, `components/ForecastView.tsx` (states), `WeekGrid.tsx`, `GridSkeleton.tsx`, `DayDetail.tsx`, `utils/labels.ts` (word + colour per label/state).
- `src/App.tsx` — header, combobox, forecast, attribution footer. `src/features/health/` + its handler deleted.
- Mocks: `src/mocks/handlers/places.ts`, `forecast.ts`, `src/mocks/fixtures/forecast.ts` (builder: Innsbruck-like week, overridable rows). Stubs for jsdom gaps in `setup.ts` if needed.
- Docs: D-026…D-028, D-014 note, `vision.md`, `docs/plan.md` (0008 cut), root `README.md`.

## Steps
1. Tooling: approve and add 3 packages, Tailwind wired, codegen scalar. App still renders.
2. Hooks + date utils with tests.
3. Combobox + search hook + handlers + tests.
4. Grid, skeleton, detail, forecast view + fixtures + tests.
5. `App` wiring, URL flow, health removed, integration test.
6. Docs, verify, close.
- One commit per step, each with its tests.

## Risks
- Headless UI in jsdom: missing `ResizeObserver` / `scrollIntoView` → small stubs in `setup.ts`.
- Debounce + `user-event` + fake timers can hang → `userEvent.setup({ advanceTimers })`.
- Combobox `displayValue` vs typed text on reload → input value set from `forecast.place` once loaded.
- TanStack retries in the app (~7 s) — tests keep `retry: false` (`renderWithProviders`).

## Proof
- Each spec acceptance criterion has a test (MSW, `renderWithProviders`).
- Manual check in the browser with `pnpm dev`: Innsbruck, Nazaré, Kraków, unknown id.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`.

## Divergence log
- 
