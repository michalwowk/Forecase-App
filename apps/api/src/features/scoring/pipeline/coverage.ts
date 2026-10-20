import type { MetricConfig } from "@/features/scoring/config/schema.ts";
import type { HourRange } from "@/features/scoring/pipeline/windows.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

/** Non-null values of `field` in the range, in time order. Missing field → none. */
export function rangeValues(
	series: HourlySeries,
	field: string,
	range: HourRange,
): number[] {
	const values = series.fields[field];
	if (!values) return [];
	return range.indices
		.map((index) => values[index])
		.filter((value): value is number => value != null);
}

const aggregators: Record<
	MetricConfig["aggregate"],
	(values: number[]) => number
> = {
	sum: (values) => values.reduce((total, v) => total + v, 0),
	max: (values) => Math.max(...values),
	mean: (values) => values.reduce((total, v) => total + v, 0) / values.length,
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
	if (values.length === 0 || values.length < minCoverage * range.expected) {
		return null;
	}
	return aggregators[metric.aggregate](values) * metric.scale;
}
