import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { UpstreamError } from "@/features/openMeteo/client/upstreamError.ts";
import {
	getPlace,
	searchPlaces,
} from "@/features/openMeteo/geocoding/geocoding.ts";
import { server } from "@/mocks/server.ts";

const URL_SEARCH = "https://geocoding-api.open-meteo.com/v1/search";
const URL_GET = "https://geocoding-api.open-meteo.com/v1/get";

const innsbruck = {
	id: 2775220,
	name: "Innsbruck",
	latitude: 47.26266,
	longitude: 11.39454,
	elevation: 570,
	feature_code: "PPLA",
	timezone: "Europe/Vienna",
	country: "Austria",
	country_code: "AT",
	admin1: "Tyrol",
};
const { feature_code: _, ...innsbruckParsed } = innsbruck;

describe("searchPlaces", () => {
	it("sends every search param and keeps Open-Meteo order", async () => {
		let params: URLSearchParams | undefined;
		const airport = { ...innsbruck, id: 6299669, name: "Innsbruck Airport" };
		server.use(
			http.get(URL_SEARCH, ({ request }) => {
				params = new URL(request.url).searchParams;
				return HttpResponse.json({ results: [airport, innsbruck] });
			}),
		);

		const places = await searchPlaces({
			name: "Innsbruck",
			count: 5,
			countryCode: "AT",
			language: "de",
		});

		expect(places.map((p) => p.id)).toEqual([6299669, 2775220]);
		expect(Object.fromEntries(params ?? [])).toEqual({
			name: "Innsbruck",
			count: "5",
			countryCode: "AT",
			language: "de",
			format: "json",
		});
	});

	it("no `results` key → empty list", async () => {
		server.use(
			http.get(URL_SEARCH, () => HttpResponse.json({ generationtime_ms: 0.1 })),
		);
		await expect(
			searchPlaces({ name: "Xqzzytown", count: 10, language: "en" }),
		).resolves.toEqual([]);
	});
});

describe("getPlace", () => {
	it("returns the place", async () => {
		server.use(http.get(URL_GET, () => HttpResponse.json(innsbruck)));
		await expect(getPlace(2775220)).resolves.toEqual(innsbruckParsed);
	});

	it("unknown id → null", async () => {
		server.use(
			http.get(URL_GET, () =>
				HttpResponse.json(
					{ reason: "Location ID not found.", error: true },
					{ status: 400 },
				),
			),
		);
		await expect(getPlace(999999999)).resolves.toBeNull();
	});

	it("any other 400 is a failure", async () => {
		server.use(
			http.get(URL_GET, () =>
				HttpResponse.json({ reason: "Other", error: true }, { status: 400 }),
			),
		);
		await expect(getPlace(1)).rejects.toBeInstanceOf(UpstreamError);
	});
});
