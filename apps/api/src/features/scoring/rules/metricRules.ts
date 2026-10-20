import type {
	MetricRule,
	ScoringConfig,
} from "@/features/scoring/config/schema.ts";

type Scale = ScoringConfig["scale"];
type RuleKind = MetricRule["kind"];
type RuleOf<K extends RuleKind> = Extract<MetricRule, { kind: K }>;

/** Share (0–1) of the way from `from` to `to`, clamped. Works in both directions. */
function progress(value: number, from: number, to: number): number {
	const share = (value - from) / (to - from);
	return Math.min(1, Math.max(0, share));
}

// Strategy L2: one function per rule kind, each returning a share 0–1 of the scale.
const rules: { [K in RuleKind]: (rule: RuleOf<K>, value: number) => number } = {
	higherIsBetter: (rule, value) => progress(value, rule.bad, rule.good),
	lowerIsBetter: (rule, value) => progress(value, rule.bad, rule.good),
	band: (rule, value) =>
		value < rule.idealMin
			? progress(value, rule.zeroBelow, rule.idealMin)
			: progress(value, rule.zeroAbove, rule.idealMax),
};

/** Metric value → sub-score on the config scale. */
export function scoreMetric(
	rule: MetricRule,
	value: number,
	scale: Scale,
): number {
	const share = (rules[rule.kind] as (r: MetricRule, v: number) => number)(
		rule,
		value,
	);
	const sub = scale.min + share * (scale.max - scale.min);
	return rule.invert ? scale.max + scale.min - sub : sub;
}
