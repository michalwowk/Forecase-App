import {
	addDays,
	HOURS_PER_DAY,
	localTime,
} from "@/features/scoring/pipeline/days.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

/** Fixed "today" for tests; the scored week starts the day after. */
export const today = "2026-10-20";
export const tomorrow = "2026-10-21";

type FieldValue = (date: string, hour: number) => number | null;

/**
 * Hourly series from `start`, `days` full days, every field computed per hour.
 * A plain number fills every hour. Mirrors Open-Meteo local time strings.
 */
export function buildSeries(
	start: string,
	days: number,
	fields: Record<string, number | null | FieldValue>,
): HourlySeries {
	const time: string[] = [];
	const hours: { date: string; hour: number }[] = [];
	for (let day = 0; day < days; day++) {
		const date = addDays(start, day);
		for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
			time.push(localTime(date, hour));
			hours.push({ date, hour });
		}
	}
	const built: Record<string, (number | null)[]> = {};
	for (const [name, value] of Object.entries(fields)) {
		built[name] = hours.map(({ date, hour }) =>
			typeof value === "function" ? value(date, hour) : value,
		);
	}
	return { time, fields: built };
}
