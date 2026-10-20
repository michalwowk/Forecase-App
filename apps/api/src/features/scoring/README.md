# Scoring

Hourly forecasts in, a 7-day × 4-activity grid out. Pure functions: no HTTP, no clock, no database.
Rules and the "why" behind every number: [`docs/product/scoring.md`](../../../../../docs/product/scoring.md).

## Read in this order (~10 min)
1. **`types.ts`**: input (`ScoreInput`: town, mountain, marine series, sea bearing, today) and output (`WeekResult` → `DayResult` per cell).
2. **`scoreWeek.ts`**: the whole flow. Read it bottom-up:
   - `scoreWeek`: 7 dates, then one row per activity.
   - `scoreRow`: no series → every day "Not applicable"; else score each day, then pick the best day.
   - `scoreDay`: one cell, in 5 numbered steps (values → no data → sub-scores → unsafe → score).
3. **`config/schema.ts`**: what each config field means (JSDoc, ASCII graphs of the rules). **`config/defaultConfig.ts`**: the values.
4. **`activities/`**: which forecast each activity uses (Strategy pattern). Only `surfing.ts` has logic: it adds waves and effective wind to the town series.
5. **`pipeline/`** and **`rules/`**: the steps `scoreDay` calls. Open them when a step needs detail.

## How one cell is scored
```
series ──▶ hours of the window ──▶ one value per metric (sum / max / mean)
                                        │
             key metric missing? ──yes──▶ No data
                                        │ no
             metric value ──rule──▶ sub-score 0–100   (missing helper metric → weight shared out)
                                        │
             dangerous hour?  ────yes──▶ Unsafe
                                        │ no
             floor + weighted sum ──▶ lowest cap ──▶ round ──▶ label + reasons
```

## Map
| File | Does |
|---|---|
| `scoreWeek.ts` | Entry point. Week → rows → days. |
| `types.ts` | Input and output shapes. |
| `config/schema.ts` | Config shape + validation. Field docs live here. |
| `config/defaultConfig.ts` | Every number and text. Change values here. |
| `activities/strategy.ts` | `ActivityStrategy`: forecast series for an activity, or `null`. |
| `activities/{skiing,outdoor,indoor}.ts` | Mountain point / town point / town point. |
| `activities/surfing.ts` | Town + marine aligned by hour + effective wind (D-020). |
| `rules/metricRules.ts` | Value → sub-score: `higherIsBetter`, `lowerIsBetter`, `band`, `invert`. |
| `pipeline/days.ts` | Week dates, local time strings. |
| `pipeline/windows.ts` | Which hours of the series a metric looks at. |
| `pipeline/values.ts` | Hour values → one metric value; coverage check. |
| `pipeline/unsafe.ts` | Unsafe triggers. |
| `pipeline/score.ts` | Weights, weighted score, caps, label. |
| `pipeline/reasons.ts` | 1–3 reason texts. |
| `pipeline/bestDay.ts` | Best day of a row. |
| `pipeline/compare.ts`, `text.ts` | `gt`/`gte`/…, `{value}` texts and rounding. |
| `test/builders.ts` | `buildSeries` for hand-built test days. |

## Common changes
- **Tune a number or text** → `defaultConfig.ts`, update `scoring.md`, run `pnpm test`.
- **New metric** → add it to the activity in `defaultConfig.ts`, rebalance weights to sum 1.
- **New rule kind** → schema union in `schema.ts` + one `case` in `rules/metricRules.ts`.
- **New activity** → add it to `ACTIVITIES` in `types.ts`; TypeScript then points to every place that needs it (strategy, schema key, config, row in `scoreWeek`).

## Tests
- `scoreWeek.test.ts`: the spec's acceptance criteria on hand-built days; expected numbers worked out in comments.
- `pipeline/*.test.ts`, `rules/*.test.ts`, `config/*.test.ts`: one piece each.
