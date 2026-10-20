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

/** Reason text if the cap's condition holds, else null. */
function capReason(
	cap: ActivityConfig["caps"][number],
	metrics: ScoredMetric[],
	series: HourlySeries,
	range: HourRange,
): string | null {
	if (cap.kind === "anyHourIn") {
		return anyHourIn(series, cap.field, range, cap.values) ? cap.reason : null;
	}
	const scored = metrics.find((m) => m.metric.id === cap.metric);
	if (!scored || !compare(cap.op, scored.value, cap.value)) return null;
	return fillValue(cap.reason, scored.value, scored.metric.decimals);
}

/** Caps whose condition holds, lowest cap first. */
export function appliedCaps(
	caps: ActivityConfig["caps"],
	metrics: ScoredMetric[],
	series: HourlySeries,
	range: HourRange,
): AppliedCap[] {
	const applied: AppliedCap[] = [];
	for (const cap of caps) {
		const reason = capReason(cap, metrics, series, range);
		if (reason) applied.push({ cap: cap.cap, reason });
	}
	return applied.toSorted((a, b) => a.cap - b.cap);
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
