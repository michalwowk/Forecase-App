import { z } from "zod";
import {
	getPlace,
	searchPlaces,
} from "@/features/openMeteo/geocoding/geocoding.ts";
import type {
	NodeResolvers,
	PlaceResolvers,
	QueryResolvers,
} from "@/generated/graphql.ts";
import { badUserInput, toGraphQLError } from "@/utils/graphqlErrors.ts";

const MAX_RESULTS = 100; // Open-Meteo `count` limit
const MAX_INT32 = 2 ** 31 - 1; // Open-Meteo ids are Int32

const searchArgs = z.object({
	query: z.string().trim().min(1, "query must not be blank"),
	first: z
		.number()
		.int()
		.min(1, "first must be 1–100")
		.max(MAX_RESULTS, "first must be 1–100"),
	countryCode: z
		.string()
		.regex(/^[A-Za-z]{2}$/, "countryCode must be 2 letters (ISO 3166-1)")
		.transform((c) => c.toUpperCase())
		.nullish(),
	language: z.string().trim().min(1, "language must not be blank"),
});

/** GeoNames id as a number; anything else can't exist → null. */
function parseId(id: string): number | null {
	if (!/^\d+$/.test(id)) return null;
	const n = Number(id);
	return n <= MAX_INT32 ? n : null;
}

export const placeQueries: Pick<QueryResolvers, "placeSearch" | "place"> = {
	placeSearch: async (_, args) => {
		const parsed = searchArgs.safeParse(args);
		if (!parsed.success) {
			throw badUserInput(parsed.error.issues.map((i) => i.message).join("; "));
		}
		const { query, first, countryCode, language } = parsed.data;
		return searchPlaces({
			name: query,
			count: first,
			countryCode: countryCode ?? undefined,
			language,
		}).catch(toGraphQLError);
	},
	place: async (_, { id }) => {
		const geonamesId = parseId(id);
		if (geonamesId === null) return null;
		return getPlace(geonamesId).catch(toGraphQLError);
	},
};

/** Place is the only Node type so far. */
export const nodeResolvers: NodeResolvers = {
	__resolveType: () => "Place",
};

/** Geocoding place → GraphQL Place fields. `forecast` lives in the forecast feature. */
export const placeFields: PlaceResolvers = {
	id: (place) => String(place.id),
	region: (place) => place.admin1 ?? null,
	country: (place) => place.country ?? null,
	countryCode: (place) => place.country_code ?? null,
	coordinates: ({ latitude, longitude }) => ({ latitude, longitude }),
};
