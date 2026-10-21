import { HttpResponse } from "msw";
import { api } from "@/mocks/api.ts";
import { buildForecast } from "@/mocks/fixtures/forecast.ts";
import { places } from "@/mocks/fixtures/places.ts";

// Known fixture place → Innsbruck-like week under its own name; anything else → null.
export const forecastHandlers = [
	api.query<object, { placeId: string }>("Forecast", ({ variables }) => {
		const place = places.find((p) => p.id === variables.placeId);
		return HttpResponse.json({
			data: { forecast: place ? { ...buildForecast(), place } : null },
		});
	}),
];
