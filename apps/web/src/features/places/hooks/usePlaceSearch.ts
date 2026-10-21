import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/gql.ts";
import type { PlaceSearchQuery as PlaceSearchResult } from "@/generated/graphql.ts";
import { request } from "@/utils/graphql.ts";

/** Shorter (trimmed) text sends nothing (D-027). */
export const MIN_QUERY_LENGTH = 2;

/** One match: id, name, region, country. */
export type PlaceOption = PlaceSearchResult["placeSearch"][number];

const PlaceSearchQuery = graphql(`
	query PlaceSearch($query: String!) {
		placeSearch(query: $query) {
			id
			name
			region
			country
		}
	}
`);

export function usePlaceSearch(query: string) {
	return useQuery({
		queryKey: ["placeSearch", query],
		queryFn: () => request(PlaceSearchQuery, { query }),
		enabled: query.length >= MIN_QUERY_LENGTH,
		select: (data) => data.placeSearch,
	});
}
