import type { MetricConfig } from "@/features/scoring/config/schema.ts";
import type { HourRange } from "@/features/scoring/pipeline/windows.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

export function sum(numbers: number[]): number {
	return numbers.reduce((total, n) => total + n, 0);
}

/** Non-null values of `field` in the range, in time order. Missing field → none. */
export function rangeValues(
	series: HourlySeries,
	field: string,
	range: HourRange,
): number[] {
	const values = series.fields[field] ?? [];
	return range.indices
		.map((index) => values[index])
		.filter((value): value is number => value != null);
}

/** True if any hour of `field` in the range is one of `values` (e.g. WMO weather codes). */
export function anyHourIn(
	series: HourlySeries,
	field: string,
	range: HourRange,
	values: number[],
): boolean {
	return rangeValues(series, field, range).some((v) => values.includes(v));
}

const aggregators: Record<
	MetricConfig["aggregate"],
	(values: number[]) => number
> = {
	sum: (values) => sum(values),
	max: (values) => Math.max(...values),
	mean: (values) => sum(values) / values.length,
};

/**
 * One metric value for the day, in shown units.
 * null when fewer than `minCoverage` of the expected hours have values.
 */
export function metricValue(
	series: HourlySeries,
	metric: Pick<MetricConfig, "field" | "aggregate" | "scale">,
	range: HourRange,
	minCoverage: number,
): number | null {
	const values = rangeValues(series, metric.field, range);
	const enoughHours = values.length >= minCoverage * range.expected;
	if (values.length === 0 || !enoughHours) return null;
	return aggregators[metric.aggregate](values) * metric.scale;
}
