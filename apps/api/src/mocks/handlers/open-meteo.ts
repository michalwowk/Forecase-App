import { readFileSync } from "node:fs";
import { HttpResponse, http } from "msw";

// Default Open-Meteo handlers: recorded real responses (fixtures/open-meteo/README.md).
// Tests override single endpoints with `server.use(...)` for failures.

/** "Now" when the fixtures were recorded. Tests pass it as the clock. */
export const RECORDED_AT = new Date("2026-10-20T17:52:13Z");

export const URLS = {
	search: "https://geocoding-api.open-meteo.com/v1/search",
	get: "https://geocoding-api.open-meteo.com/v1/get",
	elevation: "https://api.open-meteo.com/v1/elevation",
	forecast: "https://api.open-meteo.com/v1/forecast",
	marine: "https://marine-api.open-meteo.com/v1/marine",
} as const;

export const FIXTURE_PLACES = {
	innsbruck: 2775220,
	krakow: 3094802,
	nazare: 2265552,
	zakopane: 3080866,
} as const;

type FixturePlace = keyof typeof FIXTURE_PLACES;
type Endpoint = "get" | "elevation" | "forecast" | "marine";

const fixtures = new URL("../fixtures/open-meteo/", import.meta.url);

function load(file: string): unknown {
	return JSON.parse(readFileSync(new URL(file, fixtures), "utf8"));
}

export function fixture(place: FixturePlace, endpoint: Endpoint): unknown {
	return load(`${place}/${endpoint}.json`);
}

const places = Object.keys(FIXTURE_PLACES) as FixturePlace[];
const coordinates = places.map((place) => {
	const { latitude, longitude } = fixture(place, "get") as {
		latitude: number;
		longitude: number;
	};
	return { place, latitude, longitude };
});

/** Fixture place nearest to the request's first point (grid corners are ~20 km off). */
function placeFor(request: Request): FixturePlace | null {
	const params = new URL(request.url).searchParams;
	const lat = Number(params.get("latitude")?.split(",")[0]);
	const lon = Number(params.get("longitude")?.split(",")[0]);
	const MAX_DEGREES = 1;
	const near = coordinates
		.map((c) => ({ ...c, d: Math.hypot(c.latitude - lat, c.longitude - lon) }))
		.filter((c) => c.d < MAX_DEGREES)
		.sort((a, b) => a.d - b.d)[0];
	return near?.place ?? null;
}

const notFound = (reason: string) =>
	HttpResponse.json({ error: true, reason }, { status: 400 });

function byPlace(endpoint: Exclude<Endpoint, "get">) {
	return http.get(URLS[endpoint], ({ request }) => {
		const place = placeFor(request);
		if (!place) return notFound("No fixture for these coordinates");
		return HttpResponse.json(fixture(place, endpoint) as never);
	});
}

export const openMeteoHandlers = [
	http.get(URLS.search, ({ request }) => {
		const name = new URL(request.url).searchParams.get("name") ?? "";
		if (name.toLowerCase() === "paris") {
			return HttpResponse.json(load("search-paris.json") as never);
		}
		return HttpResponse.json({ generationtime_ms: 0.1 });
	}),
	http.get(URLS.get, ({ request }) => {
		const id = Number(new URL(request.url).searchParams.get("id"));
		const place = places.find((p) => FIXTURE_PLACES[p] === id);
		if (!place) return notFound("Location ID not found.");
		return HttpResponse.json(fixture(place, "get") as never);
	}),
	byPlace("elevation"),
	byPlace("forecast"),
	byPlace("marine"),
];
