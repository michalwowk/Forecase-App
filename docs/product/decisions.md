# Decisions

Format: `## D-NNN Title (date)` → Decision / Why / Rejected / Change.
Newest at the bottom. Never edit an old one; supersede it.

## D-001 English for all repo artifacts (2026-10-16)

- **Decision:** Docs, code, commits in English.
- **Why:** Reviewers read English. The brief is in English.
- **Change:** 0001

## D-002 Docs layout (2026-10-16)

- **Decision:** `docs/research`, `docs/plan.md` (roadmap), `docs/product/{vision,decisions,scoring,glossary}`, `docs/changes/NNNN-slug/{intent,spec,plan}`.
- **Why:** Stable product knowledge apart from per-change work. Each change shows its own reasoning.
- **Rejected:** Flat `docs/` with one spec/plan; one CHANGELOG file.
- **Change:** 0001

## D-003 Branch per change + PR (2026-10-16)

- **Decision:** `change/NNNN-slug` branch, PR into `main`. Agent never merges.
- **Why:** PRs show the process. Human gate on every merge.
- **Rejected:** Direct commits to `main`.
- **Change:** 0001

## D-004 Stack (2026-10-16) — superseded by D-008

- **Decision:** pnpm monorepo. `apps/api` Node + TS + graphql-yoga. `apps/web` Vite + React + TS. Vitest.
- **Why:** Brief asks for Node + GraphQL, team uses React + TS. Yoga and Vite are light and fast to set up.
- **Rejected:** Apollo Server + Client (more boilerplate); Next.js (not needed).
- **Change:** 0001, confirm in 0003.

## D-005 Worklog instead of published sessions (2026-10-16)

- **Decision:** No raw AI session exports. Process shown via `docs/worklog.md`, change folders, commits, PRs.
- **Why:** Raw sessions may leak local paths, tokens, private context.
- **Rejected:** Publishing session transcripts.
- **Change:** 0001

## D-006 Brief kept out of git (2026-10-16)

- **Decision:** Task text lives in gitignored `brief.md`, rewritten to what we build. Not quoted in docs.
- **Why:** Owner doesn't want the recruitment task public.
- **Rejected:** Committing the original brief.
- **Change:** 0001

## D-007 One skill for the whole change cycle (2026-10-16)

- **Decision:** `/change` drives intent → spec → plan → build → verify → close, with a stop after each artifact. Grilling built in.
- **Why:** One entry point is easier to follow than five skills. Gates keep human in charge.
- **Rejected:** Separate skills per step; single approval before code.
- **Change:** 0001

## D-008 No stack decision before discovery (2026-10-16)

- **Decision:** Stack and repo shape are decided in `0003-repo-scaffold`, from `0002-discovery` output. D-004 is withdrawn.
- **Why:** Don't decide how it looks before we know what we build.
- **Fixed by brief:** Node.js + GraphQL backend. React + TS front end is the default, not required.
- **Change:** 0001

## D-009 Place resolution (2026-10-19)

- **Decision:** Take the top geocoding match, show it clearly (name, region, country), offer "Not this place?" with the other matches. Surf data is for the sea near the town, not a specific beach.
- **Why:** Usually right first time; one click to fix; no extra request. We have no beach coordinates.
- **Rejected:** Always ask the user to pick; first match with no way to change.
- **Change:** 0002

## D-010 What a day is (2026-10-19)

- **Decision:** A day is a calendar day in the place's timezone. Each activity is scored on its own hour window, from hourly data. Today counts only for window hours not yet past; once closed, day 8 joins so 7 usable days show.
- **Why:** People plan in local time. Rain at 3 am shouldn't spoil a sightseeing day. Don't show days the user can't use.
- **Rejected:** Whole-day daily aggregates; user's timezone; always starting tomorrow.
- **Change:** 0002

## D-011 Score meaning (2026-10-19)

- **Decision:** Absolute 0–100 score, same thresholds everywhere. UI shows a word label + colour (Poor / Fair / Good / Great), never colour alone. Separate states: "Not applicable" (activity impossible here), "No data" (gap for that day), "Unsafe" (dangerous weather for the whole day).
- **Unsafe:** thunderstorm with hail, hurricane-force gusts, extreme heat or cold. Heavy rain is Poor, not Unsafe. Thresholds in `0004`.
- **Why:** Comparable, explainable, no history needed. Zero means "bad day"; "not applicable" means "can't do it here"; "unsafe" means "stay home".
- **Rejected:** Score relative to a place's potential (needs historical data); 7 tiers like Surfline.
- **Change:** 0002

## D-012 Skiing terrain (2026-10-19)

- **Decision:** Sample a 100-point grid (~40×40 km) with the Elevation API. Take the highest point, capped to a ski range, and forecast snow there. Show the height used ("Data for ~1900 m nearby"). No clearly higher terrain → "Not applicable".
- **Why:** Town height gives ~0 snow in Zakopane and Innsbruck. Open-Meteo only; no resort data exists there, so we say "mountains nearby", not "slope".
- **Rejected:** Town elevation; fixed offset (invents mountains); OpenStreetMap pistes (outside Open-Meteo).
- **Change:** 0002

## D-013 Indoor sightseeing (2026-10-19)

- **Decision:** Indoor complements outdoor: the worse the day outside, the better for indoor. Floor at Fair. Unsafe days are Unsafe for indoor too.
- **Why:** Helps split a week: museums on the rainy day, walks on the sunny one.
- **Rejected:** Flat score (useless ranking); pure inverse without a floor.
- **Change:** 0002

## D-014 Results UI (2026-10-19)

- **Decision:** Week grid: rows = 4 activities, columns = 7 days in calendar order, best day per row highlighted. Click a cell → detail: label, score, 1–3 reasons, key values, what the data covers. Rotates to days-as-rows on mobile.
- **Why:** Plan the whole week at a glance. Reasons explain the score. One data fetch serves the whole view.
- **Rejected:** Tabs per activity; one mixed ranking; hourly charts (later idea).
- **Change:** 0002

## D-015 MVP cuts (2026-10-19)

- **Decision:** English UI only, no i18n. Metric units only, no toggle. Hourly chart in day detail is a later idea.
- **Why:** MVP. None of them changes the ranking.
- **Change:** 0002

## D-016 Days start tomorrow (2026-10-20)

- **Decision:** The week is tomorrow + 6 local days. Today never shows. Supersedes the "today" and "day 8" part of D-010; hour windows stay.
- **Why:** "Next 7 days" means planning ahead. Partial today windows add rules for little value.
- **Rejected:** Today while windows are open + day 8 (D-010); per-row day sets (breaks grid columns).
- **Change:** 0004. Fetch `forecast_days=8` in 0005.

## D-017 Unsafe thresholds (2026-10-20)

- **Decision:** Unsafe if any window hour has weather_code 96/99, gusts ≥ 100 km/h, apparent temp ≥ 40 or ≤ −25 °C. Refines D-011: gusts at 100, not hurricane force (118).
- **Why:** 118 km/h almost never occurs at ground level, so Unsafe would never fire. 100 km/h breaks trees.
- **Change:** 0004. Needs PO/PM review.

## D-018 Target user (2026-10-20)

- **Decision:** Score for a recreational, intermediate user: piste skier, surfer on green waves, average tourist.
- **Why:** App for most people. Safer to under-rate for a pro than over-rate for a beginner (a 4 m swell is Great for a pro, dangerous for most).
- **Rejected:** Pro athletes; skill profiles with a toggle (Later).
- **Change:** 0004. Needs PO/PM review.

## D-019 Scoring model and config (2026-10-20)

- **Decision:** Per metric: aggregate window hours, sub-score by rule (higher/lower is better, band, optional invert). Score = floor + weighted sum, then deal-breaker caps. All numbers in one Zod-validated config file. Dropped fields: `cloud_cover` (duplicates sunshine), `uv_index` (no real impact).
- **Why:** Explainable ("35 % fresh snow"), caps catch day-killers, business changes one file.
- **Rejected:** Plain weighted sum (masks closed lifts); product of sub-scores (hard to explain); runtime/admin config (no DB, not needed yet).
- **Change:** 0004. **Needs PO/PM review:** every threshold and weight in `scoring.md` is a working value, not expert input.

## D-020 Surf wind vs sea bearing (2026-10-20)

- **Decision:** Wind is weighted by direction against the sea bearing (town → centre of 0 m points in the elevation grid): onshore 1.0, cross 0.7, offshore 0.4. No bearing → speed only.
- **Why:** Offshore vs onshore needs coast orientation; the grid is fetched anyway for skiing (D-012).
- **Rejected:** Swell direction as a proxy (offshore cell, oblique in bays); speed only.
- **Change:** 0004 (rule), 0005 (bearing). Weak spots: lowlands ≤ 0 m, peninsulas.

## D-021 Indoor from its own config (2026-10-20)

- **Decision:** Indoor is a normal activity with its own config: outdoor's metrics inverted, floor 40, cap 70 on heavy rain, thunderstorm or gusts ≥ 60 km/h. Window 10–20. Refines D-013.
- **Why:** No code link to outdoor, so either can change alone. Downpours still make the trip hard. 10–20 covers museum hours plus evening visits.
- **Rejected:** Formula from the outdoor result (couples the two); pure inverse (downpour = best museum day).
- **Change:** 0004. Needs PO/PM review (no opening-hours data).

## D-022 Place list, user picks (2026-10-20)

- **Decision:** Search shows Geocoding matches as-is, in Open-Meteo order, no filter or sort. The user always picks one, even if there is one match. Search takes Open-Meteo's params: count (default 10), country code, language (default `en`). Supersedes D-009.
- **Why:** Simple, predictable, same as the Open-Meteo site. No ranking rules to explain or tune.
- **Rejected:** Auto top match + "Not this place?" (D-009); own ranking (settlements only, by population).
- **Note:** `language` changes place names only; UI stays English (D-015).
- **Change:** 0005

## D-023 No cache (2026-10-20)

- **Decision:** No cache for Open-Meteo calls, terrain included. Risk of hitting the free daily limit accepted.
- **Why:** MVP / test app. Fewer moving parts. The 5×5 grid (D-024) also cuts the cost of a search.
- **Rejected:** In-memory terrain cache; cache with short TTL for forecasts.
- **Change:** 0005

## D-024 Mountain point numbers (2026-10-20)

- **Decision:** Elevation grid 5×5 (25 points), ±20 km around the town. Mountain point = highest point, capped at 2500 m. Skiing "Not applicable" if the highest point is < 1000 m or < town + 500 m. Refines D-012 (was 100 points).
- **Why:** Test app, fewer points. Live check: 5×5 keeps Zakopane (1687 m) and Innsbruck (2894 m); 3×3 drops Zakopane to 1082 m. Above ~2500 m is mostly rock and glacier, not pistes.
- **Weak spot:** a sparse grid can miss a peak → data for a lower height than the pistes.
- **Note:** Week fetched by UTC `start_hour`/`end_hour`, not `forecast_days=8` (D-016 note). Goal of D-016 unchanged.
- **Change:** 0005. Needs PO/PM review.

## D-025 Slim BFF (2026-10-20)

- **Decision:** The GraphQL API exposes only what the UI needs: `placeSearch(query)` → id, name, region, country; `forecast(placeId)` → place + 4 activity rows. Search size (10) and language (`en`) are backend constants. Partly supersedes D-022: search no longer takes count, country code or language. "Open-Meteo order, the user picks" stays.
- **Why:** It's a backend for one frontend. Everything else is backend detail. Less to learn, test and keep stable.
- **Known trade-off:** a bigger app (more clients, filters, languages) would need to widen and rethink the schema.
- **Rejected:** 0005 schema with Open-Meteo params, `Node`, `Place.forecast`; one query by name with alternatives (back to D-009).
- **Change:** 0006

## D-026 Desktop only (2026-10-21)

- **Decision:** The web UI targets desktop widths only. Supersedes the mobile part of D-014 (days-as-rows on mobile). The rest of D-014 stays.
- **Why:** Test app; the 4 × 7 grid is the core view. One layout to build and test.
- **Known trade-off:** a real app needs mobile too.
- **Rejected:** days-as-rows on mobile (D-014); responsive table with horizontal scroll.
- **Change:** 0007

## D-027 Search as you type (2026-10-21)

- **Decision:** One combobox. Trimmed text < 2 chars sends nothing; otherwise `placeSearch` 300 ms after the last keystroke. The picked place shows in the input. Keyboard and ARIA by Headless UI.
- **Why:** Fewer steps than search + list. 2 chars and the delay keep calls to Open-Meteo low.
- **Known trade-off:** 1-letter places (Å, Y) can't be found.
- **Rejected:** search on submit with a list above the grid.
- **Change:** 0007

## D-028 Place in the URL (2026-10-21)

- **Decision:** The picked place lives in `?place=<GeoNames id>`. Pick → new history entry; back/forward switch places. Unknown id → "Place not found", param removed without a history entry. No router library.
- **Why:** Refresh and shared links restore the view.
- **Rejected:** state in memory; `?query=…&place=…` (the combobox has no list to restore).
- **Change:** 0007
