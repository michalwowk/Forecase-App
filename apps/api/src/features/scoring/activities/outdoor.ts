import type { ActivityStrategy } from "@/features/scoring/activities/strategy.ts";

/** Town point. Always applicable. */
export const outdoor: ActivityStrategy = {
	series: (input) => input.town,
};
