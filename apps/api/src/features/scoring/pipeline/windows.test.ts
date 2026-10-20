import { describe, expect, it } from "vitest";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import { addDays, weekDays } from "@/features/scoring/pipeline/days.ts";
import { metricValue } from "@/features/scoring/pipeline/values.ts";
import { hourRange } from "@/features/scoring/pipeline/windows.ts";
import {
	buildSeries,
	parseLocalTime,
	today,
	tomorrow,
} from "@/features/scoring/test/builders.ts";

describe("days", () => {
	it("week starts tomorrow and has the configured length", () => {
		const days = weekDays(today, defaultConfig.week);
		expect(days).toHaveLength(defaultConfig.week.length);
		expect(days[0]).toBe(tomorrow);
		expect(days.at(-1)).toBe("2026-10-27");
	});

	it("crosses month and year ends", () => {
		expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
		expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
	});

	it("parses Open-Meteo local time", () => {
		expect(parseLocalTime("2026-10-21T09:00")).toEqual({
			date: tomorrow,
			hour: 9,
		});
	});
});

describe("hourRange", () => {
	const series = buildSeries(today, 3, { x: 1 });
	const window = { start: 9, end: 16 };
	/** Date and hour of the n-th index in a range. */
	const hourAt = (indices: number[], n: number) =>
		parseLocalTime(series.time[indices.at(n) ?? -1] ?? "");

	it("takes window hours, end excluded", () => {
		const range = hourRange(series, tomorrow, window);
		const hours = range.indices.map((_, n) => hourAt(range.indices, n).hour);
		expect(hours).toEqual([9, 10, 11, 12, 13, 14, 15]);
		expect(range.expected).toBe(window.end - window.start);
	});

	it("with fromPreviousDayHour, adds the evening before and the night", () => {
		const range = hourRange(series, tomorrow, window, 16);
		expect(hourAt(range.indices, 0)).toEqual({ date: today, hour: 16 });
		expect(hourAt(range.indices, -1)).toEqual({ date: tomorrow, hour: 15 });
		expect(range.expected).toBe(8 + 16);
		expect(range.indices).toHaveLength(range.expected);
	});

	it("counts missing hours as missing (series ends early)", () => {
		const short = buildSeries(today, 1, { x: 1 });
		expect(hourRange(short, tomorrow, window).indices).toEqual([]);
	});
});

describe("metricValue", () => {
	const window = { start: 10, end: 18 };
	const { minCoverage } = defaultConfig;
	const metric = { field: "rain", scale: 1 } as const;
	/** Rain summed over tomorrow's window. */
	const rainSum = (series: ReturnType<typeof buildSeries>) =>
		metricValue(
			series,
			{ ...metric, aggregate: "sum" },
			hourRange(series, tomorrow, window),
			minCoverage,
		);

	it("aggregates sum, max, mean", () => {
		const series = buildSeries(today, 2, { rain: (_d, h) => h - 10 });
		const range = hourRange(series, tomorrow, window);
		const value = (aggregate: "sum" | "max" | "mean") =>
			metricValue(series, { ...metric, aggregate }, range, minCoverage);
		expect(value("sum")).toBe(28); // 0 + 1 + … + 7
		expect(value("max")).toBe(7);
		expect(value("mean")).toBe(3.5);
	});

	it("applies the unit scale", () => {
		const series = buildSeries(today, 2, { sun: 3600 });
		const range = hourRange(series, tomorrow, window);
		expect(
			metricValue(
				series,
				{ field: "sun", aggregate: "sum", scale: 1 / 3600 },
				range,
				minCoverage,
			),
		).toBe(8);
	});

	it("is null below minCoverage, a value at it", () => {
		// 8 h window, 0.75 → needs 6 h.
		const missingFirst = (hours: number) =>
			buildSeries(today, 2, {
				rain: (_d, h) => (h < window.start + hours ? null : 1),
			});
		expect(rainSum(missingFirst(2))).toBe(6);
		expect(rainSum(missingFirst(3))).toBeNull();
	});

	it("is null when the field is absent", () => {
		expect(rainSum(buildSeries(today, 2, {}))).toBeNull();
	});
});
