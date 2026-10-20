import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import type { HourlySeries, ScoreInput } from "@/features/scoring/types.ts";

/**
 * Which forecast an activity is scored on (Strategy pattern: one per activity).
 * The pipeline in scoreWeek.ts does the rest the same way for all activities.
 * Returns the hourly series to score, with any added fields, or null when the activity
 * can't happen here → "Not applicable".
 */
export interface ActivityStrategy {
	series(input: ScoreInput, config: ScoringConfig): HourlySeries | null;
}
