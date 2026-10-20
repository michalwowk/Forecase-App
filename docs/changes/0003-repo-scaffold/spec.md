Status: approved

# Spec — 0003-repo-scaffold

## Requirements
- API (Node + GraphQL) and web (React + TS) start separately, or together with one command.
- GraphQL `health` query. Web calls it and shows the result.
- Commands: `dev`, `test`, `lint`, `typecheck` (root + per app). Listed in `CLAUDE.md` and README.
- GitHub Actions on every PR: `lint`, `typecheck`, `test`.
- Node 24 LTS pinned: `.nvmrc`, `engines`, CI.

## Behaviour
- Env validated with Zod at startup, one `env.ts` per app. Invalid env → exit with a clear message per bad key. Code imports the typed `env`, never `process.env`.
- Web validates only public (client-exposed) vars.
- Starts with no `.env`: defaults work. `.env.example` committed, `.env` gitignored. No secrets.
- `APP_MODE = development | test | production`, default `production` (safe default). `pnpm dev` sets `development` via a committed `.env.development`. `NODE_ENV` is for tools only; our code never reads it.

| | development | test | production |
|---|---|---|---|
| Logs | pretty, debug | silent | JSON, info |
| GraphQL introspection / playground | on | on | off |
| Error details in API responses | full | full | generic message |
| Open-Meteo (from `0005`) | real | mocked | real |

- API port from `PORT`, default 4000. Web reaches API via dev-server proxy in development; API URL overridable by env.
- API down or network error → web shows "API unavailable" + Retry. States: loading, success, error.

## Interface
- GraphQL: `type Query { health: Health! }`, `type Health { status: String! }` (exact fields may grow, e.g. version).
- Web: one page showing the health status.

## Tests
- API: `health` over HTTP against an in-memory server; env validation (valid, bad `PORT`, unknown `APP_MODE`).
- Web: component test for loading / success / "API unavailable".
- MSW in both suites. Handlers per domain in `mocks/handlers/<domain>.ts`.
  - Web: `health` GraphQL handler; per-test overrides for errors.
  - API: MSW server in test setup with `onUnhandledRequest: 'error'`; first domain (`open-meteo`) in `0005`.

## Out of scope
- Docker, deploy/hosting (`0008`), E2E tests (`0006`), pre-commit hooks.
- Log storage and observability (Sentry, Grafana): no place to ship logs. Logs go to stdout only.
- Real UI, Open-Meteo, scoring (`0004`–`0006`).

## Acceptance criteria
- [ ] Fresh clone → install → `dev` shows the health status in the browser, no `.env` needed.
- [ ] API and web each start alone with their own command.
- [ ] Bad env (e.g. `PORT=abc`, `APP_MODE=staging`) stops the API with a readable error.
- [ ] Stopping the API → web shows "API unavailable"; Retry works after restart.
- [ ] `lint`, `typecheck`, `test` pass locally and in CI on the PR.
- [ ] MSW used in both suites; an unmocked outbound request fails an API test.
- [ ] `CLAUDE.md` Commands and README "How to run" filled in.
