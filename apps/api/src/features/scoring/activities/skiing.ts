import type { ActivityStrategy } from "@/features/scoring/activities/strategy.ts";

/** Mountain point (D-012). No mountain point → not applicable. */
export const skiing: ActivityStrategy = {
	series: (input) => input.mountain,
};
