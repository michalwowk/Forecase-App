import { z } from "zod";
import { ACTIVITIES, LABELS } from "@/features/scoring/types.ts";

// Shape of the scoring config, one JSDoc per field. Values live in defaultConfig.ts.
// Strict objects everywhere: a typo in the config fails at load, not silently.
// Texts are English UI copy; `{value}` in a text is replaced by the metric or trigger value.

/** Local hour, 0–24. */
const hour = z.number().int().min(0).max(24);
/** gt >, gte ≥, lt <, lte ≤. */
const comparison = z.enum(["gt", "gte", "lt", "lte"]);
/** true → sub-score = max − rule result (indoor: bad outside = good inside). */
const invert = z.boolean().default(false);

/** `bad` → 0, `good` → 100, linear between, clamped. */
const higherIsBetter = z
	.strictObject({
		kind: z.literal("higherIsBetter"),
		bad: z.number(),
		good: z.number(),
		invert,
	})
	.refine((r) => r.bad < r.good, "bad must be below good");

/** `good` → 100, `bad` → 0, linear between, clamped. */
const lowerIsBetter = z
	.strictObject({
		kind: z.literal("lowerIsBetter"),
		good: z.number(),
		bad: z.number(),
		invert,
	})
	.refine((r) => r.good < r.bad, "good must be below bad");

/** 100 between `idealMin` and `idealMax`, falling linearly to 0 at `zeroBelow` / `zeroAbove`. */
const band = z
	.strictObject({
		kind: z.literal("band"),
		zeroBelow: z.number(),
		idealMin: z.number(),
		idealMax: z.number(),
		zeroAbove: z.number(),
		invert,
	})
	.refine(
		(r) =>
			r.zeroBelow < r.idealMin &&
			r.idealMin <= r.idealMax &&
			r.idealMax < r.zeroAbove,
		"band must be zeroBelow < idealMin <= idealMax < zeroAbove",
	);

/** How a metric value becomes a sub-score. */
export const metricRuleSchema = z.discriminatedUnion("kind", [
	higherIsBetter,
	lowerIsBetter,
	band,
]);

const metricSchema = z.strictObject({
	/** Unique within the activity; caps refer to it. */
	id: z.string().min(1),
	/** Name shown in key values. */
	label: z.string().min(1),
	/** Unit shown, after `scale`. */
	unit: z.string(),
	/** Open-Meteo hourly variable, or a field added by the activity strategy. */
	field: z.string().min(1),
	/** Window hours → one value. */
	aggregate: z.enum(["sum", "max", "mean"]),
	/** API unit → shown unit (m → cm: 100, s → h: 1/3600). */
	scale: z.number().positive().default(1),
	/** Digits shown in texts and key values. */
	decimals: z.number().int().min(0).default(0),
	/** Also take hours from this hour of the day before (overnight snow). */
	fromPreviousDayHour: hour.optional(),
	/** Share of the score. Weights of one activity sum to 1. */
	weight: z.number().positive(),
	/** true → missing means "No data" for the day. false → dropped, weights renormalised. */
	key: z.boolean().default(false),
	rule: metricRuleSchema,
	/** Text when the sub-score is above (good) or below (bad) the neutral band. */
	reasons: z.strictObject({ good: z.string(), bad: z.string() }),
});

/** Deal-breaker: condition true → score can't exceed `cap`. Lowest cap wins. */
const capSchema = z.discriminatedUnion("kind", [
	/** Aggregated metric (by `id`) compared with `value`. */
	z.strictObject({
		kind: z.literal("metric"),
		metric: z.string().min(1),
		op: comparison,
		value: z.number(),
		cap: z.number(),
		reason: z.string(),
	}),
	/** Any window hour of `field` is one of `values` (e.g. WMO weather codes). */
	z.strictObject({
		kind: z.literal("anyHourIn"),
		field: z.string().min(1),
		values: z.array(z.number()).min(1),
		cap: z.number(),
		reason: z.string(),
	}),
]);

/** "Unsafe — stay home" if any window hour matches. `{value}` = most extreme matching hour. */
const unsafeTriggerSchema = z.discriminatedUnion("kind", [
	/** Hour value of `field` compared with `value`. */
	z.strictObject({
		kind: z.literal("anyHour"),
		field: z.string().min(1),
		op: comparison,
		value: z.number(),
		reason: z.string(),
	}),
	/** Hour value of `field` is one of `values`. */
	z.strictObject({
		kind: z.literal("anyHourIn"),
		field: z.string().min(1),
		values: z.array(z.number()).min(1),
		reason: z.string(),
	}),
]);

const activitySchema = z
	.strictObject({
		/** Local hours, start included, end excluded (9–16 = 9:00 … 15:59). */
		window: z
			.strictObject({ start: hour, end: hour })
			.refine((w) => w.start < w.end, "window start must be before end"),
		/** Lowest possible score. Score = floor + (max − floor) × weighted sum. */
		floor: z.number().default(0),
		/** What is scored. */
		metrics: z.array(metricSchema).min(1),
		caps: z.array(capSchema).default([]),
		/** Text when the activity can't happen here (no sea, no mountains). */
		notApplicable: z.string(),
	})
	.refine(
		(a) => Math.abs(a.metrics.reduce((sum, m) => sum + m.weight, 0) - 1) < 1e-9,
		"metric weights must sum to 1",
	)
	.refine((a) => a.metrics.some((m) => m.key), "at least one key metric")
	.refine(
		(a) =>
			a.caps.every(
				(c) => c.kind !== "metric" || a.metrics.some((m) => m.id === c.metric),
			),
		"cap refers to an unknown metric",
	);

export const scoringConfigSchema = z
	.strictObject({
		/** Days shown: start `startOffset` days after today (1 = tomorrow), `length` days. */
		week: z.strictObject({
			startOffset: z.number().int().min(0),
			length: z.number().int().positive(),
		}),
		/** Score range. Logic never hard-codes it. */
		scale: z.strictObject({ min: z.number(), max: z.number() }),
		/** A score gets the first label whose `min` it reaches, highest first. */
		labels: z
			.array(z.strictObject({ label: z.enum(LABELS), min: z.number() }))
			.length(LABELS.length),
		/**
		 * Share of window hours (0–1) a metric needs with values to count as present.
		 * 0.75 of an 8 h window = 6 h. Below it the metric is missing (see `key`).
		 */
		minCoverage: z.number().gt(0).max(1),
		unsafe: z.array(unsafeTriggerSchema).min(1),
		reasons: z.strictObject({
			/** Max reasons per day. */
			max: z.number().int().positive(),
			/** Sub-scores from neutralMin to neutralMax are "average" and get no reason. */
			neutralMin: z.number(),
			neutralMax: z.number(),
			/** Text for "No data"; `{value}` = missing metric's label. */
			noData: z.string(),
		}),
		/** Best day per row is highlighted only if it reaches this label. */
		bestDay: z.strictObject({ minLabel: z.enum(LABELS) }),
		/** Surf wind weighted by direction vs the sea bearing. */
		surfWind: z.strictObject({
			/** Name of the added hourly field: speed × factor. Metrics refer to it. */
			field: z.string().min(1),
			/** Open-Meteo fields for wind speed and the direction it blows from. */
			speedField: z.string().min(1),
			directionField: z.string().min(1),
			/** Wind from within this angle of the sea bearing is onshore. */
			onshoreMaxAngle: z.number().min(0).max(180),
			/** Wind from at least this angle off the sea bearing is offshore. Between → cross. */
			offshoreMinAngle: z.number().min(0).max(180),
			/** Speed multipliers. `noBearing` when the sea bearing is unknown. */
			factors: z.strictObject({
				onshore: z.number().min(0),
				cross: z.number().min(0),
				offshore: z.number().min(0),
				noBearing: z.number().min(0),
			}),
		}),
		/** One entry per activity. */
		activities: z.strictObject(
			Object.fromEntries(ACTIVITIES.map((a) => [a, activitySchema])) as Record<
				(typeof ACTIVITIES)[number],
				typeof activitySchema
			>,
		),
	})
	.refine((c) => c.scale.min < c.scale.max, "scale min must be below max")
	.refine(
		(c) => new Set(c.labels.map((l) => l.label)).size === c.labels.length,
		"each label must appear once",
	)
	.refine(
		(c) => c.reasons.neutralMin <= c.reasons.neutralMax,
		"neutralMin must not exceed neutralMax",
	)
	.refine(
		(c) => c.surfWind.onshoreMaxAngle <= c.surfWind.offshoreMinAngle,
		"onshoreMaxAngle must not exceed offshoreMinAngle",
	);

export type ScoringConfig = z.output<typeof scoringConfigSchema>;
export type ScoringConfigInput = z.input<typeof scoringConfigSchema>;
export type ActivityConfig =
	ScoringConfig["activities"][keyof ScoringConfig["activities"]];
export type MetricConfig = ActivityConfig["metrics"][number];
export type MetricRule = z.output<typeof metricRuleSchema>;
export type CapConfig = ActivityConfig["caps"][number];
export type UnsafeTrigger = ScoringConfig["unsafe"][number];

export function parseScoringConfig(input: ScoringConfigInput): ScoringConfig {
	const result = scoringConfigSchema.safeParse(input);
	if (!result.success) {
		throw new Error(
			`Invalid scoring config:\n${z.prettifyError(result.error)}`,
		);
	}
	return result.data;
}
