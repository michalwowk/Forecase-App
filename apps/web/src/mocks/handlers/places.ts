import { HttpResponse } from "msw";
import { api } from "@/mocks/api.ts";
import { places } from "@/mocks/fixtures/places.ts";

// Prefix match on the name, like Open-Meteo Geocoding.
export const placeHandlers = [
	api.query<object, { query: string }>("PlaceSearch", ({ variables }) => {
		const query = variables.query.toLowerCase();
		return HttpResponse.json({
			data: {
				placeSearch: places.filter((p) =>
					p.name.toLowerCase().startsWith(query),
				),
			},
		});
	}),
];
