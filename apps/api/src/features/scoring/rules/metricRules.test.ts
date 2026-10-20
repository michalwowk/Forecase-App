import { describe, expect, it } from "vitest";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import type { MetricRule } from "@/features/scoring/config/schema.ts";
import { scoreMetric } from "@/features/scoring/rules/metricRules.ts";

const { scale } = defaultConfig;

const higher: MetricRule = {
	kind: "higherIsBetter",
	bad: 0,
	good: 15,
	invert: false,
};
const lower: MetricRule = {
	kind: "lowerIsBetter",
	good: 30,
	bad: 60,
	invert: false,
};
const band: MetricRule = {
	kind: "band",
	zeroBelow: 0,
	idealMin: 18,
	idealMax: 24,
	zeroAbove: 35,
	invert: false,
};

describe("scoreMetric", () => {
	it("higherIsBetter: bad → min, good → max, linear between, clamped", () => {
		expect(scoreMetric(higher, 0, scale)).toBe(scale.min);
		expect(scoreMetric(higher, 7.5, scale)).toBe(50);
		expect(scoreMetric(higher, 15, scale)).toBe(scale.max);
		expect(scoreMetric(higher, 40, scale)).toBe(scale.max);
		expect(scoreMetric(higher, -3, scale)).toBe(scale.min);
	});

	it("lowerIsBetter: good → max, bad → min, clamped", () => {
		expect(scoreMetric(lower, 10, scale)).toBe(scale.max);
		expect(scoreMetric(lower, 45, scale)).toBe(50);
		expect(scoreMetric(lower, 90, scale)).toBe(scale.min);
	});

	it("band: max inside the ideal, falling to min at both zero points", () => {
		expect(scoreMetric(band, 18, scale)).toBe(scale.max);
		expect(scoreMetric(band, 21, scale)).toBe(scale.max);
		expect(scoreMetric(band, 24, scale)).toBe(scale.max);
		expect(scoreMetric(band, 9, scale)).toBe(50);
		expect(scoreMetric(band, 29.5, scale)).toBe(50);
		expect(scoreMetric(band, -5, scale)).toBe(scale.min);
		expect(scoreMetric(band, 40, scale)).toBe(scale.min);
	});

	it("invert flips the sub-score", () => {
		expect(scoreMetric({ ...higher, invert: true }, 0, scale)).toBe(scale.max);
		expect(scoreMetric({ ...higher, invert: true }, 15, scale)).toBe(scale.min);
		expect(scoreMetric({ ...band, invert: true }, 21, scale)).toBe(scale.min);
		expect(scoreMetric({ ...band, invert: true }, -5, scale)).toBe(scale.max);
	});

	it("follows the configured scale", () => {
		expect(scoreMetric(higher, 7.5, { min: 0, max: 10 })).toBe(5);
	});
});
