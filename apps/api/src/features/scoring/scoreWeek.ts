import { strategies } from "@/features/scoring/activities/index.ts";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import type {
	ActivityConfig,
	MetricConfig,
	ScoringConfig,
} from "@/features/scoring/config/schema.ts";
import { bestDay } from "@/features/scoring/pipeline/bestDay.ts";
import { weekDays } from "@/features/scoring/pipeline/days.ts";
import { pickReasons } from "@/features/scoring/pipeline/reasons.ts";
import {
	appliedCaps,
	labelFor,
	renormalise,
	type ScoredMetric,
	weightedScore,
} from "@/features/scoring/pipeline/score.ts";
import { fillText, roundTo } from "@/features/scoring/pipeline/text.ts";
import { unsafeReason } from "@/features/scoring/pipeline/unsafe.ts";
import { metricValue } from "@/features/scoring/pipeline/values.ts";
import { hourRange } from "@/features/scoring/pipeline/windows.ts";
import { scoreMetric } from "@/features/scoring/rules/metricRules.ts";
import type {
	Activity,
	ActivityRow,
	DayResult,
	HourlySeries,
	KeyValue,
	ScoreInput,
	WeekResult,
} from "@/features/scoring/types.ts";

// Read bottom-up: scoreWeek (week) → scoreRow (one activity) → scoreDay (one cell).

function toKeyValues(metrics: ScoredMetric[]): KeyValue[] {
	return metrics.map(({ metric, value }) => ({
		metric: metric.id,
		label: metric.label,
		value: roundTo(value, metric.decimals),
		unit: metric.unit,
	}));
}

/** A cell without a score: not applicable, no data or unsafe. */
function unscoredDay(
	date: string,
	state: Exclude<DayResult["state"], "scored">,
	reason: string,
	keyValues: KeyValue[] = [],
): DayResult {
	return {
		date,
		state,
		score: null,
		label: null,
		reasons: [reason],
		keyValues,
	};
}

/** One activity on one day. Checks in order: no data → unsafe → scored. */
function scoreDay(
	series: HourlySeries,
	activity: ActivityConfig,
	config: ScoringConfig,
	date: string,
): DayResult {
	// 1. One value per metric from its hours (null = not enough data).
	const values = activity.metrics.map((metric) => {
		const range = hourRange(
			series,
			date,
			activity.window,
			metric.fromPreviousDayHour,
		);
		return {
			metric,
			value: metricValue(series, metric, range, config.minCoverage),
		};
	});

	// 2. A key metric is missing → we can't judge the day.
	const missingKey = values.find((v) => v.metric.key && v.value === null);
	if (missingKey) {
		const reason = fillText(config.reasons.noData, missingKey.metric.label);
		return unscoredDay(date, "noData", reason);
	}

	// 3. Sub-score each present metric; missing helper metrics hand their weight to the rest.
	const present = values.filter(
		(v): v is { metric: MetricConfig; value: number } => v.value !== null,
	);
	const metrics = renormalise(
		present.map(({ metric, value }) => ({
			metric,
			value,
			sub: scoreMetric(metric.rule, value, config.scale),
		})),
	);

	// 4. Dangerous hour in the window → stay home, but still show the values.
	const window = hourRange(series, date, activity.window);
	const unsafe = unsafeReason(series, window, config.unsafe);
	if (unsafe) {
		return unscoredDay(date, "unsafe", unsafe, toKeyValues(metrics));
	}

	// 5. Weighted score, lowered by any deal-breaker cap.
	const raw = weightedScore(metrics, activity.floor, config.scale);
	const caps = appliedCaps(activity.caps, metrics, series, window, raw);
	const score = Math.round(Math.min(raw, ...caps.map((c) => c.cap)));

	return {
		date,
		state: "scored",
		score,
		label: labelFor(score, config.labels),
		reasons: pickReasons(caps, metrics, config.reasons),
		keyValues: toKeyValues(metrics),
	};
}

/** One activity over the week. No series → every day is "Not applicable". */
function scoreRow(
	series: HourlySeries | null,
	activity: ActivityConfig,
	config: ScoringConfig,
	days: string[],
): ActivityRow {
	const results = days.map((date) =>
		series
			? scoreDay(series, activity, config, date)
			: unscoredDay(date, "notApplicable", activity.notApplicable),
	);
	return { days: results, bestDay: bestDay(results, config.bestDay) };
}

/** Hourly forecasts → 7 days × 4 activities. Pure: no I/O, no clock. */
export function scoreWeek(
	input: ScoreInput,
	config: ScoringConfig = defaultConfig,
): WeekResult {
	const days = weekDays(input.today, config.week);
	const row = (activity: Activity) =>
		scoreRow(
			strategies[activity].series(input, config),
			config.activities[activity],
			config,
			days,
		);
	return {
		days,
		rows: {
			skiing: row("skiing"),
			surfing: row("surfing"),
			outdoor: row("outdoor"),
			indoor: row("indoor"),
		},
	};
}
