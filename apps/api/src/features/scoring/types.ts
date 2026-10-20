export const ACTIVITIES = ["skiing", "surfing", "outdoor", "indoor"] as const;
export type Activity = (typeof ACTIVITIES)[number];

export const LABELS = ["Poor", "Fair", "Good", "Great"] as const;
export type Label = (typeof LABELS)[number];

export type DayState = "scored" | "notApplicable" | "noData" | "unsafe";

// One Open-Meteo hourly block. `time` is local ISO without offset ("2026-10-21T09:00").
// `fields` uses Open-Meteo variable names; values align with `time` by index.
export interface HourlySeries {
	time: readonly string[];
	fields: Readonly<Record<string, readonly (number | null)[]>>;
}

export interface ScoreInput {
	/** Local date of the place, YYYY-MM-DD. The week starts the day after. */
	today: string;
	/** Forecast at the town point. */
	town: HourlySeries;
	/** Forecast at the mountain point. null → skiing not applicable. */
	mountain: HourlySeries | null;
	/** Marine at the town point. null or all-null → surfing not applicable. */
	marine: HourlySeries | null;
	/** Degrees, town → sea. null → surf wind scored on speed only. */
	seaBearing: number | null;
}

export interface KeyValue {
	metric: string;
	label: string;
	value: number;
	unit: string;
}

export interface DayResult {
	date: string;
	state: DayState;
	score: number | null;
	label: Label | null;
	reasons: string[];
	keyValues: KeyValue[];
}

export interface ActivityRow {
	days: DayResult[];
	bestDay: string | null;
}

export interface WeekResult {
	days: string[];
	rows: Record<Activity, ActivityRow>;
}
