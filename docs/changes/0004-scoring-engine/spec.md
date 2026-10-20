Status: approved

# Spec — 0004-scoring-engine

## Requirements
- Pure function: hourly series in → 7 days × 4 activities out. No I/O.
- Days = tomorrow + 6, local dates of the place. Today never shows (supersedes D-010 part).
- Every number lives in one typed, Zod-validated config. No numbers in logic.
- Rules, weights, thresholds: `docs/product/scoring.md` (written with this spec).
- Target user: recreational, intermediate, all activities. All numbers "Needs PO/PM review".

## Behaviour
- Window per activity in local hours, end exclusive: ski 9–16, surf 7–19, outdoor 10–18, indoor 10–20 (opening hours + evening trip home). Ski fresh snow also counts from 16:00 the day before.
- Per metric: aggregate window hours (sum / max / mean), then score 0–100 by its rule (`higherIsBetter`, `lowerIsBetter`, `band`), linear, clamped. `invert: true` → 100 − sub-score.
- Score = floor + (100 − floor) × weighted sum (floor per activity, default 0), then deal-breaker caps (lowest cap wins), rounded to integer. Labels: Poor 0–39, Fair 40–59, Good 60–79, Great 80–100.
- Order of states per day: notApplicable → noData → unsafe → scored.
  - notApplicable: no mountain series (ski), no marine series or all values null (surf). Whole row.
  - noData: a key metric has values in < 75 % of window hours. Missing auxiliary metric → dropped, weights renormalised.
  - unsafe: any window hour with weather_code 96/99, gusts ≥ 100 km/h, apparent temp ≥ 40 or ≤ −25 °C. Ski checks mountain series, others town.
- Indoor is a normal activity with its own config, no dependency on outdoor: outdoor's metrics with `invert`, floor 40, cap 70 on rain ≥ 10 mm, weather_code 95 or gusts ≥ 60 km/h. Unsafe/noData from its own window (same series and limits as outdoor).
- Surf wind: effective speed = speed × direction factor (onshore 1.0, cross 0.7, offshore 0.4) vs `seaBearing`. Onshore = wind from within 60° of sea bearing, offshore ≥ 120°. No bearing → factor 1.0.
- Reasons (1–3): caps first, then metrics by `weight × |subScore − 50|`, skipping subscores 40–60. Good/bad text templates with value in config. Special states → one reason.
- bestDay: highest score among scored days, earliest on tie, none if its label is below Fair.
- Units out: cm snow (API `snow_depth` is m), hours of sun (API is seconds), km/h, °C, mm, m, s.

## Interface
```ts
scoreWeek(input: {
  today: string;                 // local date YYYY-MM-DD
  town: HourlySeries;            // Forecast at town point, local ISO times
  mountain: HourlySeries | null; // null → skiing notApplicable
  marine: HourlySeries | null;   // null or all-null → surfing notApplicable
  seaBearing: number | null;     // degrees, town → sea; from 0005
}, config?: ScoringConfig): WeekResult

WeekResult = { days: string[]; rows: Record<Activity, { days: DayResult[]; bestDay: string | null }> }
DayResult  = { date; state: "scored"|"notApplicable"|"noData"|"unsafe"; score: number|null;
               label: "Poor"|"Fair"|"Good"|"Great"|null; reasons: string[];
               keyValues: { metric; label; value; unit }[] }
```
- Lives in `apps/api`. Exact folders → plan.

## Out of scope
- GraphQL schema, Open-Meteo client, real-data fixtures, mountain point and `seaBearing` computation → 0005.
- Daylight-based windows (`is_day`), skill profiles, runtime config → Later.
- Dropped fields: `cloud_cover` (duplicates sunshine), `uv_index` (owner: no real impact).

## Decisions to log
- Days from tomorrow (supersedes D-010 part) · Unsafe thresholds, gusts 100 km/h (refines D-011) · Target user · Scoring model + config + "Needs PO/PM review" · Surf wind from sea bearing · Indoor from own config with invert + floor, travel cap (refines D-013).

## Acceptance criteria
- [x] `scoreWeek` returns 7 days starting tomorrow, same dates in every row.
- [x] Hand-built days: ideal ski day → Great; 3 °C rain on 5 cm base → Poor; gusts 75 km/h → ≤ 30.
- [x] Surf: 1.5 m / 12 s / light offshore → Great; swell 3.5 m → ≤ 30; all-null marine → notApplicable.
- [x] Outdoor: sunny 21 °C dry → Great; 12 mm rain → ≤ 25. Indoor: ideal outdoor day → 40; 4 mm rain, 0 °C, no sun → Great; 15 mm rain → 70.
- [x] Each unsafe trigger → unsafe for every activity on that series; indoor logic imports nothing from outdoor.
- [x] Key metric < 75 % coverage → noData; missing auxiliary → scored with renormalised weights.
- [x] Reasons: 1–3 per day, cap reason first; bestDay tie → earliest; best below Fair → null.
- [x] Changing a config value changes the result without touching logic (test overrides config).
- [x] No numeric thresholds in logic files (reviewed by verifier).
- [x] `scoring.md` explains the pipeline and every number with a "why"; decisions logged.
