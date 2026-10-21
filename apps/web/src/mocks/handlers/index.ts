import { forecastHandlers } from "@/mocks/handlers/forecast.ts";
import { healthHandlers } from "@/mocks/handlers/health.ts";
import { placeHandlers } from "@/mocks/handlers/places.ts";

// One file per domain.
export const handlers = [
	...healthHandlers,
	...placeHandlers,
	...forecastHandlers,
];
