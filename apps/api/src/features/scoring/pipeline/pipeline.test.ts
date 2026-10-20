import { describe, expect, it } from "vitest";
import { effectiveWind } from "@/features/scoring/activities/surfing.ts";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import type { MetricConfig } from "@/features/scoring/config/schema.ts";
import { bestDay } from "@/features/scoring/pipeline/bestDay.ts";
import { pickReasons } from "@/features/scoring/pipeline/reasons.ts";
import {
	labelFor,
	renormalise,
	type ScoredMetric,
	weightedScore,
} from "@/features/scoring/pipeline/score.ts";
import type { DayResult } from "@/features/scoring/types.ts";

const { scale, labels, reasons: reasonConfig, surfWind } = defaultConfig;

/** Minimal scored metric; only the fields these functions read are set. */
function metric(id: string, weight: number, sub: number): ScoredMetric {
	const config = {
		id,
		weight,
		decimals: 0,
		reasons: { good: `${id} good`, bad: `${id} bad` },
	} as MetricConfig;
	return { metric: config, value: sub, sub, weight };
}

describe("labelFor", () => {
	it("uses the label bands from config", () => {
		expect(labelFor(0, labels)).toBe("Poor");
		expect(labelFor(39, labels)).toBe("Poor");
		expect(labelFor(40, labels)).toBe("Fair");
		expect(labelFor(60, labels)).toBe("Good");
		expect(labelFor(79, labels)).toBe("Good");
		expect(labelFor(80, labels)).toBe("Great");
	});
});

describe("weightedScore", () => {
	it("is the weighted sum on the scale, lifted by the floor", () => {
		const metrics = [metric("a", 0.5, 100), metric("b", 0.5, 0)];
		expect(weightedScore(metrics, 0, scale)).toBe(50);
		expect(weightedScore(metrics, 40, scale)).toBe(70);
	});

	it("renormalise spreads missing weight over present metrics", () => {
		const present = renormalise([metric("a", 0.3, 100), metric("b", 0.1, 0)]);
		expect(present[0]?.weight).toBeCloseTo(0.75);
		expect(present[1]?.weight).toBeCloseTo(0.25);
	});
});

describe("pickReasons", () => {
	it("caps first, then by impact, skipping neutral, at most max", () => {
		const metrics = [
			metric("small", 0.1, 0),
			metric("neutral", 0.3, 50),
			metric("big", 0.4, 100),
			metric("mid", 0.2, 10),
		];
		const caps = [{ cap: 20, reason: "capped" }];
		expect(pickReasons(caps, metrics, reasonConfig)).toEqual([
			"capped",
			"big good",
			"mid bad",
		]);
	});

	it("all neutral → still one reason from the strongest metric", () => {
		const metrics = [metric("a", 0.2, 45), metric("b", 0.8, 58)];
		expect(pickReasons([], metrics, reasonConfig)).toEqual(["b good"]);
	});
});

describe("bestDay", () => {
	const scored = (date: string, score: number): DayResult => ({
		date,
		state: "scored",
		score,
		label: labelFor(score, labels),
		reasons: [],
		keyValues: [],
	});

	it("ignores days that are not scored", () => {
		const days: DayResult[] = [
			{ ...scored("d1", 0), state: "unsafe", score: null, label: null },
			scored("d2", 55),
		];
		expect(bestDay(days, defaultConfig.bestDay)).toBe("d2");
	});

	it("earliest on a tie, null below the min label", () => {
		expect(
			bestDay([scored("d1", 70), scored("d2", 70)], defaultConfig.bestDay),
		).toBe("d1");
		expect(bestDay([scored("d1", 30)], defaultConfig.bestDay)).toBeNull();
	});
});

describe("effectiveWind", () => {
	const speed = 20;
	it("weights speed by direction vs the sea bearing", () => {
		expect(effectiveWind(speed, 270, 270, surfWind)).toBe(speed); // onshore
		expect(effectiveWind(speed, 0, 270, surfWind)).toBeCloseTo(speed * 0.7); // cross
		expect(effectiveWind(speed, 90, 270, surfWind)).toBeCloseTo(speed * 0.4); // offshore
	});

	it("wraps around north", () => {
		expect(effectiveWind(speed, 350, 10, surfWind)).toBe(speed); // 20° → onshore
	});

	it("no sea bearing → speed × noBearing factor", () => {
		expect(effectiveWind(speed, 90, null, surfWind)).toBe(
			speed * surfWind.factors.noBearing,
		);
	});
});
