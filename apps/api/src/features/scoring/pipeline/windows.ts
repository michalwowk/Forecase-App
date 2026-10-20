import type { ActivityConfig } from "@/features/scoring/config/schema.ts";
import {
	addDays,
	HOURS_PER_DAY,
	localTime,
} from "@/features/scoring/pipeline/days.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

/** Hours a metric looks at on one day: indices into the series + how many there should be. */
export interface HourRange {
	indices: number[];
	expected: number;
}

/**
 * Hours of `date` from `window.start` (included) to `window.end` (excluded).
 * With `fromPreviousDayHour`, the range starts the evening before instead (overnight snow).
 * Local ISO times sort as text, so the range is a plain string comparison.
 */
export function hourRange(
	series: HourlySeries,
	date: string,
	window: ActivityConfig["window"],
	fromPreviousDayHour?: number,
): HourRange {
	const fromEvening = fromPreviousDayHour !== undefined;
	const start = fromEvening
		? localTime(addDays(date, -1), fromPreviousDayHour)
		: localTime(date, window.start);
	const end = localTime(date, window.end);

	const indices: number[] = [];
	series.time.forEach((time, index) => {
		if (time >= start && time < end) indices.push(index);
	});

	const expected = fromEvening
		? HOURS_PER_DAY - fromPreviousDayHour + window.end
		: window.end - window.start;
	return { indices, expected };
}
