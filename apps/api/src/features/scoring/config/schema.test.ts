import { describe, expect, it } from "vitest";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import {
	parseScoringConfig,
	type ScoringConfigInput,
} from "@/features/scoring/config/schema.ts";
import { ACTIVITIES } from "@/features/scoring/types.ts";

function withChange(
	change: (config: ScoringConfigInput) => void,
): ScoringConfigInput {
	const config = structuredClone(defaultConfig) as ScoringConfigInput;
	change(config);
	return config;
}

describe("scoring config", () => {
	it("default config is valid and covers every activity", () => {
		expect(Object.keys(defaultConfig.activities).sort()).toEqual(
			[...ACTIVITIES].sort(),
		);
	});

	it("fills defaults (invert false, floor 0, scale 1)", () => {
		const freshSnow = defaultConfig.activities.skiing.metrics[0];
		expect(freshSnow?.rule.invert).toBe(false);
		expect(defaultConfig.activities.skiing.floor).toBe(0);
		expect(defaultConfig.activities.outdoor.metrics[0]?.scale).toBe(1);
	});

	it("rejects weights that don't sum to 1", () => {
		const config = withChange((c) => {
			const metric = c.activities.outdoor.metrics[0];
			if (metric) metric.weight = 0.5;
		});
		expect(() => parseScoringConfig(config)).toThrow(/weights must sum to 1/);
	});

	it("rejects an unknown rule kind", () => {
		const config = withChange((c) => {
			const metric = c.activities.outdoor.metrics[0];
			if (metric) (metric.rule as { kind: string }).kind = "random";
		});
		expect(() => parseScoringConfig(config)).toThrow(/Invalid scoring config/);
	});

	it("rejects a band with ideal outside its zero points", () => {
		const config = withChange((c) => {
			const metric = c.activities.outdoor.metrics[2];
			if (metric) {
				metric.rule = {
					kind: "band",
					zeroBelow: 20,
					idealMin: 18,
					idealMax: 24,
					zeroAbove: 35,
				};
			}
		});
		expect(() => parseScoringConfig(config)).toThrow(/band must be/);
	});

	it("rejects a cap on an unknown metric", () => {
		const config = withChange((c) => {
			c.activities.skiing.caps?.push({
				kind: "metric",
				metric: "nope",
				op: "gte",
				value: 1,
				cap: 10,
				reason: "x",
			});
		});
		expect(() => parseScoringConfig(config)).toThrow(/unknown metric/);
	});

	it("rejects typos in keys", () => {
		const config = withChange((c) => {
			(c.week as Record<string, unknown>).lenght = 7;
		});
		expect(() => parseScoringConfig(config)).toThrow(/Invalid scoring config/);
	});
});
