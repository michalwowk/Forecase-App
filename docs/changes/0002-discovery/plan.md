Status: approved

# Plan — 0002-discovery

## Files
- `docs/changes/0002-discovery/*` — intent, spec, plan.
- `docs/research/open-meteo-{geocoding,forecast,marine}.md`, `competitors.md`, `data-selection.md` — new.
- `docs/product/decisions.md` — product and UI decisions.
- `docs/product/vision.md` — final, with ASCII sketch and states.
- `docs/plan.md`, `docs/worklog.md` — status and close entry.

## Steps
1. Commit intent, spec, plan, roadmap status.
2. Research in parallel subagents: geocoding, forecast (+ elevation, air quality), marine, competitors. Live curl for the 6 places. Commit notes.
3. Write `data-selection.md` from the notes. Commit.
4. Product + UI session: one question at a time, total announced first. Log decisions.
5. Rewrite `vision.md`. Commit decisions + vision.
6. Verify, close.

## Risks
- Competitor sites block fetching → use their public help/docs pages, say so in the note.
- Model data looks wrong (e.g. `snow_depth` in town) → record it as a finding, not hide it.
- A note grows past ~60 lines → split it.
- Open-Meteo docs disagree with live responses → trust live response, note both.

## Proof
- `verifier` checks the 5 acceptance criteria.
- `grep -L "AI research (Claude)" docs/research/*.md` prints nothing.
- `wc -l docs/research/*.md` — each ≤ ~60.

## Divergence log
-
