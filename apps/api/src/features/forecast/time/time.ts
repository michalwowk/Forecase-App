import type {
	UtcHourlySeries,
	UtcHourRange,
} from "@/features/openMeteo/client/hourly.ts";
import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import { addDays, weekDays } from "@/features/scoring/pipeline/days.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

// Open-Meteo talks UTC (openMeteo/README.md); scoring talks local time. This file converts.
// Local and UTC times are both "YYYY-MM-DDTHH:mm" without offset.

const MS_PER_HOUR = 3_600_000;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string): Intl.DateTimeFormat {
	let f = formatters.get(timezone);
	if (!f) {
		f = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hourCycle: "h23",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
		formatters.set(timezone, f);
	}
	return f;
}

/** Wall-clock parts of an instant in `timezone`. */
function wallClock(ms: number, timezone: string) {
	const parts = Object.fromEntries(
		formatter(timezone)
			.formatToParts(ms)
			.map((p) => [p.type, p.value]),
	);
	return {
		date: `${parts.year}-${parts.month}-${parts.day}`,
		time: `${parts.hour}:${parts.minute}`,
	};
}

/** Offset of `timezone` at an instant, in ms (Vienna in summer → +2 h). */
function offsetAt(ms: number, timezone: string): number {
	const { date, time } = wallClock(ms, timezone);
	return Date.parse(`${date}T${time}:00Z`) - ms;
}

/** Local `date` at `hour` (0–24) in `timezone` → UTC instant. */
export function localToUtc(
	date: string,
	hour: number,
	timezone: string,
): number {
	const asUtc = Date.parse(`${date}T00:00:00Z`) + hour * MS_PER_HOUR;
	// Second pass picks the offset valid at the result, not at the guess (DST days).
	const guess = asUtc - offsetAt(asUtc, timezone);
	return asUtc - offsetAt(guess, timezone);
}

/** UTC instant → "YYYY-MM-DDTHH:mm" in UTC, the Open-Meteo format. */
export function formatUtc(ms: number): string {
	return new Date(ms).toISOString().slice(0, "YYYY-MM-DDTHH:mm".length);
}

/** Open-Meteo UTC time → local time in `timezone`. */
export function utcToLocal(utcTime: string, timezone: string): string {
	const { date, time } = wallClock(Date.parse(`${utcTime}:00Z`), timezone);
	return `${date}T${time}`;
}

/** Today's date in `timezone`. */
export function localToday(now: Date, timezone: string): string {
	return wallClock(now.getTime(), timezone).date;
}

/**
 * UTC hours to fetch: every hour any activity looks at, from the earliest window start
 * (incl. overnight snow the evening before day 1) to the latest window end on the last day.
 */
export function fetchRange(
	today: string,
	timezone: string,
	config: ScoringConfig,
): UtcHourRange {
	const days = weekDays(today, config.week);
	const first = days[0] ?? today;
	const last = days.at(-1) ?? today;
	const activities = Object.values(config.activities);

	const starts = activities.flatMap((a) => [
		localToUtc(first, a.window.start, timezone),
		...a.metrics.flatMap((m) =>
			m.fromPreviousDayHour === undefined
				? []
				: [localToUtc(addDays(first, -1), m.fromPreviousDayHour, timezone)],
		),
	]);
	const ends = activities.map((a) => localToUtc(last, a.window.end, timezone));

	// Window ends are excluded; Open-Meteo's end_hour is included.
	return {
		start: formatUtc(Math.min(...starts)),
		end: formatUtc(Math.max(...ends) - MS_PER_HOUR),
	};
}

/** Same values, local times. A repeated DST hour appears twice; a skipped one is absent. */
export function toLocalSeries(
	series: UtcHourlySeries,
	timezone: string,
): HourlySeries {
	return {
		time: series.time.map((t) => utcToLocal(t, timezone)),
		fields: series.fields,
	};
}
