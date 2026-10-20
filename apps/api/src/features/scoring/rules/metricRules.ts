import type {
	MetricRule,
	ScoringConfig,
} from "@/features/scoring/config/schema.ts";

/** Share (0–1) of the way from `from` to `to`, clamped. Works in both directions. */
function progress(value: number, from: number, to: number): number {
	const share = (value - from) / (to - from);
	return Math.min(1, Math.max(0, share));
}

/** How far (0–1) the value is from the rule's 0-point to its best point. Graphs in schema.ts. */
function shareOfBest(rule: MetricRule, value: number): number {
	switch (rule.kind) {
		// Same formula for both: `progress` runs from `bad` to `good` whichever is larger.
		case "higherIsBetter":
		case "lowerIsBetter":
			return progress(value, rule.bad, rule.good);
		case "band":
			return value < rule.idealMin
				? progress(value, rule.zeroBelow, rule.idealMin)
				: progress(value, rule.zeroAbove, rule.idealMax);
	}
}

/** Metric value → sub-score on the config scale (0–100 by default). */
export function scoreMetric(
	rule: MetricRule,
	value: number,
	scale: ScoringConfig["scale"],
): number {
	const sub = scale.min + shareOfBest(rule, value) * (scale.max - scale.min);
	return rule.invert ? scale.max + scale.min - sub : sub;
}
