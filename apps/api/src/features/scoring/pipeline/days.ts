import type { ScoringConfig } from "@/features/scoring/config/schema.ts";

// Calendar facts, not scoring numbers.
export const HOURS_PER_DAY = 24;
const MS_PER_DAY = 86_400_000;

/** "2026-10-21" + n days → "2026-10-23". Pure date arithmetic, no timezone. */
export function addDays(date: string, days: number): string {
	return new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY)
		.toISOString()
		.slice(0, "YYYY-MM-DD".length);
}

/** Local dates shown, from `today` (D-016: tomorrow + 6). */
export function weekDays(today: string, week: ScoringConfig["week"]): string[] {
	return Array.from({ length: week.length }, (_, i) =>
		addDays(today, week.startOffset + i),
	);
}

/** "2026-10-21", 9 → "2026-10-21T09:00", the Open-Meteo local time format. */
export function localTime(date: string, hour: number): string {
	return `${date}T${String(hour).padStart(2, "0")}:00`;
}

/** Open-Meteo local time "2026-10-21T09:00" → date and hour. */
export function parseLocalTime(time: string): { date: string; hour: number } {
	const [date = "", clock = ""] = time.split("T");
	return { date, hour: Number.parseInt(clock, 10) };
}
