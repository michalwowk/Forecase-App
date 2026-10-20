import { addDays, HOURS_PER_DAY } from "@/features/scoring/pipeline/days.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

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
			time.push(`${date}T${String(hour).padStart(2, "0")}:00`);
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
