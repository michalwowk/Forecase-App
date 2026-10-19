Status: approved

# Intent — 0002-discovery

## Problem
- We don't know what Open-Meteo really gives for our four activities (snow, waves, places).
- `vision.md` is a draft with open product questions.
- Without both, `0003` would pick a stack and shape blind.

## Outcome
- `docs/research/` notes: which Open-Meteo data exists, what real responses look like, which fields we pick and why.
- Short competitor note: how 2–3 apps show "the best day".
- Product questions from `vision.md` decided and logged in `decisions.md`.
- `vision.md` final.

## Users / systems affected
- Docs only. Feeds `0003-repo-scaffold` and `0004-scoring-engine`.

## Constraints
- No code committed. One-off curl queries only; results go into the notes.
- Research notes are marked as AI research.
- Weights, thresholds and metric math stay in `0004`.

## Open questions
- None at intent level. Edge cases go to spec.
