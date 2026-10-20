import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import type {
	AppliedCap,
	ScoredMetric,
} from "@/features/scoring/pipeline/score.ts";
import { fillValue } from "@/features/scoring/pipeline/text.ts";

/**
 * Up to `max` reasons: caps first (lowest cap first), then the metrics that moved the score
 * most (weight × distance from the neutral centre), good or bad. Neutral metrics are skipped;
 * if all are neutral, the strongest one is used so a day always has a reason.
 */
export function pickReasons(
	caps: AppliedCap[],
	metrics: ScoredMetric[],
	config: ScoringConfig["reasons"],
): string[] {
	const centre = (config.neutralMin + config.neutralMax) / 2;
	const impact = (m: ScoredMetric) => m.weight * Math.abs(m.sub - centre);
	const isNeutral = (m: ScoredMetric) =>
		m.sub >= config.neutralMin && m.sub <= config.neutralMax;

	const byImpact = metrics.toSorted((a, b) => impact(b) - impact(a));
	const notNeutral = byImpact.filter((m) => !isNeutral(m));
	const chosen = notNeutral.length > 0 ? notNeutral : byImpact.slice(0, 1);

	const metricReasons = chosen.map((m) => {
		const isGood = m.sub >= centre;
		const text = isGood ? m.metric.reasons.good : m.metric.reasons.bad;
		return fillValue(text, m.value, m.metric.decimals);
	});

	return [...caps.map((c) => c.reason), ...metricReasons].slice(0, config.max);
}
