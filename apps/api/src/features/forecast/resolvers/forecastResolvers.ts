import {
	type PlaceForecast,
	placeForecast,
} from "@/features/forecast/service/placeForecast.ts";
import {
	getPlace,
	parsePlaceId,
} from "@/features/openMeteo/geocoding/geocoding.ts";
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
import { badUserInput, toGraphQLError } from "@/utils/graphqlErrors.ts";

const STATES: Record<DayState, GqlDayState> = {
	scored: "SCORED",
	notApplicable: "NOT_APPLICABLE",
	noData: "NO_DATA",
	unsafe: "UNSAFE",
};

/** Only the fields the schema exposes (D-025); internal ids like `metric` stay behind. */
function toDay(day: DayResult): DayForecast {
	return {
		date: day.date,
		state: STATES[day.state],
		score: day.score,
		label: day.label && (day.label.toUpperCase() as GqlLabel),
		reasons: day.reasons,
		keyValues: day.keyValues.map(({ label, value, unit }) => ({
			label,
			value,
			unit,
		})),
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
	forecast: async (_, { placeId }, { now, forecastBudget }) => {
		// Aliases could ask for many forecasts at once; each costs 4 Open-Meteo calls.
		if (forecastBudget.left <= 0) {
			throw badUserInput("Only one forecast per request");
		}
		forecastBudget.left -= 1;
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
