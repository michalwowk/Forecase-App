import type {
	ActivityConfig,
	MetricConfig,
	ScoringConfig,
} from "@/features/scoring/config/schema.ts";
import { compare } from "@/features/scoring/pipeline/compare.ts";
import { fillValue } from "@/features/scoring/pipeline/text.ts";
import { anyHourIn, sum } from "@/features/scoring/pipeline/values.ts";
import type { HourRange } from "@/features/scoring/pipeline/windows.ts";
import type { HourlySeries, Label } from "@/features/scoring/types.ts";

/** A metric that has a value for the day. */
export interface ScoredMetric {
	metric: MetricConfig;
	/** Aggregated value in shown units (e.g. 12 mm). */
	value: number;
	/** Sub-score on the scale (e.g. 0–100). */
	sub: number;
	/** Weight after dropping missing metrics; present weights sum to 1. */
	weight: number;
}

export interface AppliedCap {
	cap: number;
	reason: string;
	/** The metric the cap checks, if any; its own reason is then left out. */
	metricId?: string;
}

/** Spread the weight of missing metrics over the present ones. */
export function renormalise(
	present: Omit<ScoredMetric, "weight">[],
): ScoredMetric[] {
	const total = sum(present.map((m) => m.metric.weight));
	return present.map((m) => ({ ...m, weight: m.metric.weight / total }));
}

/** floor + (max − floor) × weighted share of the scale. Not rounded. */
export function weightedScore(
	metrics: ScoredMetric[],
	floor: number,
	scale: ScoringConfig["scale"],
): number {
	const weighted = sum(metrics.map((m) => m.weight * m.sub));
	const share = (weighted - scale.min) / (scale.max - scale.min);
	return floor + (scale.max - floor) * share;
}

/** The cap if its condition holds, else null. */
function checkCap(
	cap: ActivityConfig["caps"][number],
	metrics: ScoredMetric[],
	series: HourlySeries,
	range: HourRange,
): AppliedCap | null {
	if (cap.kind === "anyHourIn") {
		const hit = anyHourIn(series, cap.field, range, cap.values);
		return hit ? { cap: cap.cap, reason: cap.reason } : null;
	}
	const scored = metrics.find((m) => m.metric.id === cap.metric);
	if (!scored || !compare(cap.op, scored.value, cap.value)) return null;
	const reason = fillValue(cap.reason, scored.value, scored.metric.decimals);
	return { cap: cap.cap, reason, metricId: cap.metric };
}

/**
 * Caps that actually lower `score`, lowest first.
 * A cap above the score changes nothing, so it is not a reason either.
 */
export function appliedCaps(
	caps: ActivityConfig["caps"],
	metrics: ScoredMetric[],
	series: HourlySeries,
	range: HourRange,
	score: number,
): AppliedCap[] {
	return caps
		.map((cap) => checkCap(cap, metrics, series, range))
		.filter((c): c is AppliedCap => c !== null && c.cap < score)
		.toSorted((a, b) => a.cap - b.cap);
}

/** The highest label whose `min` the score reaches. */
export function labelFor(
	score: number,
	labels: ScoringConfig["labels"],
): Label {
	const highestFirst = labels.toSorted((a, b) => b.min - a.min);
	const found = highestFirst.find((l) => score >= l.min) ?? highestFirst.at(-1);
	if (!found) throw new Error("No labels configured");
	return found.label;
}
