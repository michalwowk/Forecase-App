import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { URLS } from "@/mocks/handlers/open-meteo.ts";
import { server } from "@/mocks/server.ts";
import { errorCodes, execute } from "@/test/graphql.ts";

const SEARCH = /* GraphQL */ `
	query Search($query: String!) {
		placeSearch(query: $query) { id name region country }
	}
`;

type Search = {
	placeSearch: {
		id: string;
		name: string;
		region: string | null;
		country: string | null;
	}[];
};

/** Captures the Geocoding search query string. */
function captureSearch() {
	const seen: { params?: URLSearchParams } = {};
	server.use(
		http.get(URLS.search, ({ request }) => {
			seen.params = new URL(request.url).searchParams;
			return HttpResponse.json({});
		}),
	);
	return seen;
}

describe("placeSearch", () => {
	it("returns matches in Open-Meteo order", async () => {
		const result = await execute<Search>(SEARCH, { query: "Paris" });
		const places = result.data?.placeSearch ?? [];
		expect(places).toHaveLength(10);
		expect(places[0]).toEqual({
			id: "2988507",
			name: "Paris",
			region: "Île-de-France Region",
			country: "France",
		});
		expect(places.map((p) => p.region).slice(1, 3)).toEqual([
			"Texas",
			"Tennessee",
		]);
	});

	it("sends the trimmed query with backend constants: 10 results, English, no country filter", async () => {
		const seen = captureSearch();
		await execute(SEARCH, { query: " Paris " });
		expect(Object.fromEntries(seen.params ?? [])).toEqual({
			name: "Paris",
			count: "10",
			language: "en",
			format: "json",
		});
	});

	it("no matches → empty list", async () => {
		const result = await execute<Search>(SEARCH, { query: "Xqzzytown" });
		expect(result).toEqual({ data: { placeSearch: [] } });
	});

	it("blank query → BAD_USER_INPUT", async () => {
		const result = await execute(SEARCH, { query: "  " });
		expect(errorCodes(result)).toEqual(["BAD_USER_INPUT"]);
		expect(result.data).toBeNull();
	});

	it("Geocoding down → UPSTREAM_UNAVAILABLE", async () => {
		server.use(
			http.get(URLS.search, () => new HttpResponse(null, { status: 502 })),
		);
		const result = await execute(SEARCH, { query: "Paris" });
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
		expect(result.data).toBeNull();
	});
});
