import type { ActivityStrategy } from "@/features/scoring/activities/strategy.ts";

/** Town point, own config (D-021). Deliberately independent of outdoor. */
export const indoor: ActivityStrategy = {
	series: (input) => input.town,
};
