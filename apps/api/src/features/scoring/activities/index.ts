import { indoor } from "@/features/scoring/activities/indoor.ts";
import { outdoor } from "@/features/scoring/activities/outdoor.ts";
import { skiing } from "@/features/scoring/activities/skiing.ts";
import type { ActivityStrategy } from "@/features/scoring/activities/strategy.ts";
import { surfing } from "@/features/scoring/activities/surfing.ts";
import type { Activity } from "@/features/scoring/types.ts";

export const strategies: Record<Activity, ActivityStrategy> = {
	skiing,
	surfing,
	outdoor,
	indoor,
};
