import { z } from "zod";
import { searchPlaces } from "@/features/openMeteo/geocoding/geocoding.ts";
import type { PlaceResolvers, QueryResolvers } from "@/generated/graphql.ts";
import { badUserInput, toGraphQLError } from "@/utils/graphqlErrors.ts";

// D-025: the UI only sends what the user typed; the rest are backend constants.
const SEARCH_RESULTS = 10;
const SEARCH_LANGUAGE = "en"; // D-015: English only

const query = z.string().trim().min(1, "query must not be blank");

export const placeQueries: Pick<QueryResolvers, "placeSearch"> = {
	placeSearch: async (_, args) => {
		const parsed = query.safeParse(args.query);
		if (!parsed.success) {
			throw badUserInput(parsed.error.issues.map((i) => i.message).join("; "));
		}
		return searchPlaces({
			name: parsed.data,
			count: SEARCH_RESULTS,
			language: SEARCH_LANGUAGE,
		}).catch(toGraphQLError);
	},
};

/** Geocoding place → GraphQL Place fields. */
export const placeFields: PlaceResolvers = {
	id: (place) => String(place.id),
	region: (place) => place.admin1 ?? null,
	country: (place) => place.country ?? null,
};
