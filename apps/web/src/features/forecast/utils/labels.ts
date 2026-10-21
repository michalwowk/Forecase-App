import type {
	ActivityRow,
	Day,
} from "@/features/forecast/hooks/useForecast.ts";

export const ACTIVITY_NAMES: Record<ActivityRow["activity"], string> = {
	SKIING: "Skiing",
	SURFING: "Surfing",
	OUTDOOR: "Outdoor",
	INDOOR: "Indoor",
};

type Look = { word: string; className: string };

// Every look has a word: colour is never the only signal.
const LABELS: Record<NonNullable<Day["label"]>, Look> = {
	GREAT: { word: "Great", className: "bg-emerald-600 text-white" },
	GOOD: { word: "Good", className: "bg-emerald-100 text-emerald-900" },
	FAIR: { word: "Fair", className: "bg-amber-100 text-amber-900" },
	POOR: { word: "Poor", className: "bg-slate-200 text-slate-700" },
};

const STATES: Record<Exclude<Day["state"], "SCORED">, Look> = {
	UNSAFE: { word: "Unsafe", className: "bg-red-600 text-white font-semibold" },
	NO_DATA: {
		word: "No data",
		className: "border border-dashed border-slate-300 text-slate-500 italic",
	},
	NOT_APPLICABLE: { word: "Not applicable", className: "text-slate-500" },
};

export function dayLook(day: Day): Look {
	if (day.state === "SCORED") {
		return day.label ? LABELS[day.label] : STATES.NO_DATA;
	}
	return STATES[day.state];
}
