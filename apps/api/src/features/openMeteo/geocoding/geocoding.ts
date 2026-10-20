import { z } from "zod";
import { buildUrl, getJson } from "@/features/openMeteo/client/getJson.ts";
import { UpstreamError } from "@/features/openMeteo/client/upstreamError.ts";

const BASE = "https://geocoding-api.open-meteo.com/v1";
/** Open-Meteo ids are Int32. */
const MAX_ID = 2 ** 31 - 1;
/** Open-Meteo's 400 text for an unknown id on `/get`. */
const NOT_FOUND_REASON = "Location ID not found.";

// Only the fields we use. Open-Meteo omits empty fields, hence the optionals.
const place = z.object({
	id: z.number().int(),
	name: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	elevation: z.number().optional(),
	timezone: z.string(),
	country: z.string().optional(),
	country_code: z.string().optional(),
	admin1: z.string().optional(),
});

export type GeocodingPlace = z.infer<typeof place>;

// No match → HTTP 200 without `results`.
const searchResponse = z
	.object({ results: z.array(place).optional() })
	.transform((r) => r.results ?? []);

export interface PlaceSearch {
	name: string;
	count: number;
	countryCode?: string;
	language: string;
}

/** Matches in Open-Meteo order, as-is (D-022). */
export function searchPlaces(search: PlaceSearch): Promise<GeocodingPlace[]> {
	const url = buildUrl(`${BASE}/search`, {
		name: search.name,
		count: search.count,
		countryCode: search.countryCode,
		language: search.language,
		format: "json",
	});
	return getJson("geocoding", url, searchResponse);
}

/** Canonical GeoNames id ("2775220", no leading zeros) as a number; anything else → null. */
export function parsePlaceId(id: string): number | null {
	if (!/^[1-9]\d*$/.test(id)) return null;
	const n = Number(id);
	return n <= MAX_ID ? n : null;
}

/** One place by GeoNames id; unknown id → null. */
export async function getPlace(id: number): Promise<GeocodingPlace | null> {
	try {
		return await getJson("geocoding", buildUrl(`${BASE}/get`, { id }), place);
	} catch (error) {
		const notFound =
			error instanceof UpstreamError &&
			error.status === 400 &&
			error.reason === NOT_FOUND_REASON;
		if (notFound) return null;
		throw error;
	}
}
