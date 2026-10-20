import type { ActivityConfig } from "@/features/scoring/config/schema.ts";
import {
	addDays,
	HOURS_PER_DAY,
	parseLocalTime,
} from "@/features/scoring/pipeline/days.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

/** Hours a metric looks at on one day: indices into the series + how many there should be. */
export interface HourRange {
	indices: number[];
	expected: number;
}

/**
 * Window hours of `date` (start included, end excluded).
 * With `fromPreviousDayHour`, also the day before from that hour, through the night.
 */
export function hourRange(
	series: HourlySeries,
	date: string,
	window: ActivityConfig["window"],
	fromPreviousDayHour?: number,
): HourRange {
	const previous = addDays(date, -1);
	const fromStart = fromPreviousDayHour === undefined;
	const indices: number[] = [];

	series.time.forEach((time, index) => {
		const local = parseLocalTime(time);
		const inDay = fromStart
			? local.date === date &&
				local.hour >= window.start &&
				local.hour < window.end
			: local.date === date && local.hour < window.end;
		const inPreviousEvening =
			!fromStart &&
			local.date === previous &&
			local.hour >= fromPreviousDayHour;
		if (inDay || inPreviousEvening) indices.push(index);
	});

	const expected = fromStart
		? window.end - window.start
		: HOURS_PER_DAY - fromPreviousDayHour + window.end;
	return { indices, expected };
}
