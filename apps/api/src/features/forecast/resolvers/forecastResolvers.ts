import {
	type PlaceForecast,
	placeForecast,
} from "@/features/forecast/service/placeForecast.ts";
import { getPlace } from "@/features/openMeteo/geocoding/geocoding.ts";
import { parsePlaceId } from "@/features/places/resolvers/placeResolvers.ts";
import {
	ACTIVITIES,
	type Activity,
	type DayResult,
	type DayState,
} from "@/features/scoring/types.ts";
import type {
	ActivityForecast,
	DayForecast,
	Activity as GqlActivity,
	DayState as GqlDayState,
	Label as GqlLabel,
	QueryResolvers,
} from "@/generated/graphql.ts";
import { toGraphQLError } from "@/utils/graphqlErrors.ts";

const STATES: Record<DayState, GqlDayState> = {
	scored: "SCORED",
	notApplicable: "NOT_APPLICABLE",
	noData: "NO_DATA",
	unsafe: "UNSAFE",
};

function toDay(day: DayResult): DayForecast {
	return {
		...day,
		state: STATES[day.state],
		label: day.label && (day.label.toUpperCase() as GqlLabel),
	};
}

/** Rows whose data comes from a call that may fail on its own (partial failure). */
function isAvailable(activity: Activity, forecast: PlaceForecast): boolean {
	if (activity === "skiing") return forecast.available.skiing;
	if (activity === "surfing") return forecast.available.surfing;
	return true;
}

function toActivity(
	activity: Activity,
	forecast: PlaceForecast,
): ActivityForecast {
	const row = forecast.week.rows[activity];
	const available = isAvailable(activity, forecast);
	return {
		activity: activity.toUpperCase() as GqlActivity,
		available,
		dataElevation: activity === "skiing" ? forecast.dataElevation : null,
		bestDay: available ? row.bestDay : null,
		days: available ? row.days.map(toDay) : [],
	};
}

export const forecastQueries: Pick<QueryResolvers, "forecast"> = {
	forecast: async (_, { placeId }, { now }) => {
		const id = parsePlaceId(placeId);
		if (id === null) return null;
		try {
			const place = await getPlace(id);
			if (!place) return null;
			const forecast = await placeForecast(place, now());
			return {
				place,
				activities: ACTIVITIES.map((a) => toActivity(a, forecast)),
			};
		} catch (error) {
			return toGraphQLError(error);
		}
	},
};
