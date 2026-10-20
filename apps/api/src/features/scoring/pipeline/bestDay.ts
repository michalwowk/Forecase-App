import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import { type DayResult, LABELS } from "@/features/scoring/types.ts";

/** Highest scored day, earliest on a tie. null if none, or the best is below `minLabel`. */
export function bestDay(
	days: DayResult[],
	config: ScoringConfig["bestDay"],
): string | null {
	let best: DayResult | undefined;
	for (const day of days) {
		if (day.state !== "scored") continue;
		// Strictly greater: on a tie the earlier day stays.
		if (!best || (day.score ?? 0) > (best.score ?? 0)) best = day;
	}
	if (!best?.label) return null;
	// LABELS runs worst → best, so a higher index is a better label.
	const reaches = LABELS.indexOf(best.label) >= LABELS.indexOf(config.minLabel);
	return reaches ? best.date : null;
}
