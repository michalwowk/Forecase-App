import type {
	ActivityRow,
	Day,
	Forecast,
} from "@/features/forecast/hooks/useForecast.ts";
import { innsbruck } from "@/mocks/fixtures/places.ts";

export const WEEK = [
	"2026-10-22",
	"2026-10-23",
	"2026-10-24",
	"2026-10-25",
	"2026-10-26",
	"2026-10-27",
	"2026-10-28",
];

const LABEL_OF: Record<string, Day["label"]> = {
	Great: "GREAT",
	Good: "GOOD",
	Fair: "FAIR",
	Poor: "POOR",
};

/** One day from a short code: "Great 86", "Unsafe", "No data", "N/A". */
function day(date: string, code: string): Day {
	const [word = "", score] = code.split(" ");
	const label = LABEL_OF[word];
	if (label) {
		return {
			date,
			state: "SCORED",
			score: Number(score),
			label,
			reasons: [`${word} day`],
			keyValues: [{ label: "Gusts", value: 20, unit: "km/h" }],
		};
	}
	const unscored: Record<string, [Day["state"], string]> = {
		Unsafe: ["UNSAFE", "Violent gusts up to 110 km/h — stay home"],
		"No data": ["NO_DATA", "Missing forecast data: Rain"],
	};
	const [state, reason] = unscored[code] ?? ["NOT_APPLICABLE", code];
	return {
		date,
		state,
		score: null,
		label: null,
		reasons: [reason],
		keyValues: [],
	};
}

function row(
	activity: ActivityRow["activity"],
	codes: string[],
	extra: Partial<ActivityRow> = {},
): ActivityRow {
	return {
		activity,
		available: true,
		dataElevation: null,
		bestDay: null,
		days: codes.map((code, i) => day(WEEK[i] ?? "", code)),
		...extra,
	};
}

const notApplicable = (reason: string) => WEEK.map(() => reason);

const skiing = row(
	"SKIING",
	["Fair 45", "Good 70", "Great 86", "Good 65", "Unsafe", "Fair 50", "Fair 41"],
	{ dataElevation: 2200, bestDay: WEEK[2] },
);
skiing.days[2] = {
	...day(WEEK[2] ?? "", "Great 86"),
	reasons: [
		"Fresh snow 14 cm",
		"Light wind (gusts 15 km/h)",
		"Sunny afternoon",
	],
	keyValues: [
		{ label: "Fresh snow", value: 14, unit: "cm" },
		{ label: "Snow depth", value: 80, unit: "cm" },
	],
};

/** Innsbruck-like week: skiing with a best day, no sea, a No data day. Rows can be swapped. */
export function buildForecast(
	rows: Partial<Record<ActivityRow["activity"], ActivityRow>> = {},
): Forecast {
	return {
		place: innsbruck,
		activities: [
			rows.SKIING ?? skiing,
			rows.SURFING ?? row("SURFING", notApplicable("No sea near this place")),
			rows.OUTDOOR ??
				row(
					"OUTDOOR",
					[
						"Good 62",
						"Great 81",
						"Poor 20",
						"No data",
						"Unsafe",
						"Good 66",
						"Good 61",
					],
					{ bestDay: WEEK[1] },
				),
			rows.INDOOR ??
				row(
					"INDOOR",
					[
						"Fair 48",
						"Fair 45",
						"Great 70",
						"Good 64",
						"Unsafe",
						"Fair 47",
						"Fair 49",
					],
					{ bestDay: WEEK[2] },
				),
		],
	};
}

/** A row the API couldn't load (partial failure). */
export function unavailableRow(activity: ActivityRow["activity"]): ActivityRow {
	return {
		activity,
		available: false,
		dataElevation: null,
		bestDay: null,
		days: [],
	};
}

/** A fully scored row without a best day (nothing reaches Fair). */
export function poorRow(activity: ActivityRow["activity"]): ActivityRow {
	return row(
		activity,
		WEEK.map((_, i) => `Poor ${10 + i}`),
	);
}
