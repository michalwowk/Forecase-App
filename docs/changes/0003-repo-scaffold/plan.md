Status: approved

# Plan — 0003-repo-scaffold

## Choices (grilled)
- pnpm workspaces: `apps/api`, `apps/web`. No Turbo/Nx.
- API: graphql-yoga on `node:http`; Node 24 native type stripping (`erasableSyntaxOnly`), no tsx; pino + pino-pretty (dev).
- Schema-first `apps/api/schema.graphql` + GraphQL Codegen for API resolvers and web queries. Generated files gitignored, built by `pre*` scripts.
- Web: Vite + React + TS; own typed `fetch` + TanStack Query; Vite proxy `/graphql` → API.
- Tooling: Vitest (both apps), Testing Library, MSW (handlers per domain), Zod env, Biome.

## Files
- Root: `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `biome.json`, `tsconfig.base.json`, `.gitignore`.
- `apps/api`: `src/{env,logger,schema,server,index}.ts`, `schema.graphql`, `codegen.ts`, `mocks/`, tests, `.env.example`.
- `apps/web`: `src/{env,App,main}`, `src/features/health/components/`, `src/utils/graphql.ts`, `vite.config.ts`, `codegen.ts`, `mocks/`, tests, `.env.example`.
- `.github/workflows/ci.yml`.
- `CLAUDE.md` (Commands), `README.md` (How to run, Cut).

## Steps
1. Commit intent, spec, plan, roadmap.
2. Root workspace + Biome + TS base + Node pin. Commit.
3. API: env, logger, schema, `health`, server, tests (MSW setup). Commit.
4. Web: env, Vite proxy, `health` query, 3 states, tests (MSW). Commit.
5. CI workflow + docs (Commands, How to run, Cut). Commit.
6. Verify: run all commands, manual run of the acceptance checks, verifier. Close.

## Risks
- Codegen / Yoga / MSW version friction on Node 24 → pin versions that install clean; note in divergence log.
- Native TS stripping rejects a dependency pattern → only our code is stripped; fall back to tsx if blocked.
- Vite env vs Zod: `import.meta.env` only exposes `VITE_*` → validate that object only.

## Proof
- `pnpm lint && pnpm typecheck && pnpm test` green locally and in CI.
- Fresh clone in a temp dir → `pnpm i && pnpm dev` → health shown.
- `PORT=abc` / `APP_MODE=staging` → API exits with readable error.
- API stopped → "API unavailable"; Retry after restart works.

## Divergence log
- Codegen runs as `pnpm codegen && …` inside each script, not `pre*` hooks: explicit and pnpm-version proof.
- MSW 3 API differs from v2: `onUnhandledFrame` (old `onUnhandledRequest` is silently ignored), GraphQL via `graphql.link()` from `msw/graphql`.
- Web needs `@graphql-typed-document-node/core` (types for codegen output).
- `.gitignore`: `!.env.example` and `generated/` added.
- `APP_MODE` defaults to `production` (safe default); `pnpm dev` loads committed `apps/api/.env.development`.
- Per-app `lint` scripts; `.gitattributes` forces LF (Windows CRLF noise).
- /simplify: `z.prettifyError` replaces hand-written env error format; Biome config trimmed to non-defaults; `start` skips codegen (types only).
- Web `src/` follows `features/<feature>/<concern>/` + shared `utils/` (user rule, in `CLAUDE.md`).
- Absolute imports via package.json `imports` (`#src/*`, `#mocks/*`): native in Node, TS, Vite; no alias config.
- Web depends on `@forecase/api` (`workspace:*`, dev); API `exports` only `schema.graphql`. Web codegen reads it from `node_modules`.
