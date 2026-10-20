import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { URLS } from "@/mocks/handlers/open-meteo.ts";
import { server } from "@/mocks/server.ts";
import { errorCodes, execute } from "@/test/graphql.ts";

const SEARCH = /* GraphQL */ `
	query Search($query: String!, $first: Int, $countryCode: String, $language: String) {
		placeSearch(query: $query, first: $first, countryCode: $countryCode, language: $language) {
			id
			name
			region
			country
			countryCode
			coordinates { latitude longitude }
			timezone
		}
	}
`;
const PLACE = /* GraphQL */ `
	query Place($id: ID!) {
		place(id: $id) { id name region country timezone }
	}
`;

type Search = {
	placeSearch: { id: string; name: string; region: string | null }[];
};

describe("placeSearch", () => {
	it("returns matches in Open-Meteo order", async () => {
		const result = await execute<Search>(SEARCH, { query: "Paris" });
		const places = result.data?.placeSearch ?? [];
		expect(places).toHaveLength(10);
		expect(places[0]).toMatchObject({
			id: "2988507",
			name: "Paris",
			region: "Île-de-France Region",
			country: "France",
			countryCode: "FR",
			timezone: "Europe/Paris",
		});
		expect(places.map((p) => p.region).slice(1, 3)).toEqual([
			"Texas",
			"Tennessee",
		]);
	});

	it("passes first, countryCode and language to Open-Meteo", async () => {
		let params: URLSearchParams | undefined;
		server.use(
			http.get(URLS.search, ({ request }) => {
				params = new URL(request.url).searchParams;
				return HttpResponse.json({});
			}),
		);
		await execute(SEARCH, {
			query: " Paris ",
			first: 3,
			countryCode: "us",
			language: "de",
		});
		expect(Object.fromEntries(params ?? [])).toMatchObject({
			name: "Paris",
			count: "3",
			countryCode: "US",
			language: "de",
		});
	});

	it("defaults to 10 results in English", async () => {
		let params: URLSearchParams | undefined;
		server.use(
			http.get(URLS.search, ({ request }) => {
				params = new URL(request.url).searchParams;
				return HttpResponse.json({});
			}),
		);
		await execute(SEARCH, { query: "Paris" });
		expect(params?.get("count")).toBe("10");
		expect(params?.get("language")).toBe("en");
		expect(params?.has("countryCode")).toBe(false);
	});

	it("no matches → empty list", async () => {
		const result = await execute<Search>(SEARCH, { query: "Xqzzytown" });
		expect(result).toEqual({ data: { placeSearch: [] } });
	});

	it.each([
		["blank query", { query: "  " }],
		["first 0", { query: "Paris", first: 0 }],
		["first 101", { query: "Paris", first: 101 }],
		["country code not 2 letters", { query: "Paris", countryCode: "FRA" }],
	])("%s → BAD_USER_INPUT", async (_, variables) => {
		const result = await execute(SEARCH, variables);
		expect(errorCodes(result)).toEqual(["BAD_USER_INPUT"]);
		expect(result.data).toBeNull();
	});

	it("Geocoding down → UPSTREAM_UNAVAILABLE", async () => {
		server.use(
			http.get(URLS.search, () => new HttpResponse(null, { status: 502 })),
		);
		const result = await execute(SEARCH, { query: "Paris" });
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
	});
});

describe("place", () => {
	it("returns the place by id", async () => {
		const result = await execute(PLACE, { id: "2775220" });
		expect(result.data).toEqual({
			place: {
				id: "2775220",
				name: "Innsbruck",
				region: "Tyrol",
				country: "Austria",
				timezone: "Europe/Vienna",
			},
		});
	});

	it.each(["999999999", "abc", "99999999999"])(
		"unknown id %s → null",
		async (id) => {
			const result = await execute(PLACE, { id });
			expect(result).toEqual({ data: { place: null } });
		},
	);

	it("Geocoding down → UPSTREAM_UNAVAILABLE", async () => {
		server.use(http.get(URLS.get, () => HttpResponse.error()));
		const result = await execute(PLACE, { id: "2775220" });
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
		expect(result.data).toEqual({ place: null });
	});
});
