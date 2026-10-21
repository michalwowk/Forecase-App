import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/gql.ts";
import type { ForecastQuery as ForecastResult } from "@/generated/graphql.ts";
import { request } from "@/utils/graphql.ts";

/** Place + 4 activity rows; null for an unknown place id. */
export type Forecast = NonNullable<ForecastResult["forecast"]>;
export type ActivityRow = Forecast["activities"][number];
export type Day = ActivityRow["days"][number];

const ForecastQuery = graphql(`
	query Forecast($placeId: ID!) {
		forecast(placeId: $placeId) {
			place {
				id
				name
				region
				country
			}
			activities {
				activity
				available
				dataElevation
				bestDay
				days {
					date
					state
					score
					label
					reasons
					keyValues {
						label
						value
						unit
					}
				}
			}
		}
	}
`);

export function useForecast(placeId: string | null) {
	return useQuery({
		queryKey: ["forecast", placeId],
		queryFn: () => request(ForecastQuery, { placeId: placeId ?? "" }),
		enabled: placeId !== null,
		select: (data) => data.forecast,
	});
}
