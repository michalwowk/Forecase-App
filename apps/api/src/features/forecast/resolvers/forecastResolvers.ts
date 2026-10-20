import {
	type PlaceForecast,
	placeForecast,
} from "@/features/forecast/service/placeForecast.ts";
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
	PlaceResolvers,
	WeekForecast,
} from "@/generated/graphql.ts";
import { badUserInput, toGraphQLError } from "@/utils/graphqlErrors.ts";

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
	const best = row.days.find((d) => d.date === row.bestDay);
	return {
		activity: activity.toUpperCase() as GqlActivity,
		available,
		days: available ? row.days.map(toDay) : [],
		bestDay: available && best ? toDay(best) : null,
		dataElevation: activity === "skiing" ? forecast.dataElevation : null,
	};
}

export function toWeekForecast(forecast: PlaceForecast): WeekForecast {
	return {
		days: forecast.week.days,
		activities: ACTIVITIES.map((a) => toActivity(a, forecast)),
	};
}

export const placeForecastField: PlaceResolvers = {
	forecast: (place, _, { now, forecastBudget }) => {
		if (forecastBudget.left <= 0) {
			throw badUserInput(
				"Only one forecast per request: query place(id) instead",
			);
		}
		forecastBudget.left -= 1;
		return placeForecast(place, now()).then(toWeekForecast, toGraphQLError);
	},
};
