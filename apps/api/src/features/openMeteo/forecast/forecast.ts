import { buildUrl, getJson } from "@/features/openMeteo/client/getJson.ts";
import {
	hourlyResponse,
	oneOrMany,
	UTC,
	type UtcHourlySeries,
	type UtcHourRange,
} from "@/features/openMeteo/client/hourly.ts";

const URL_FORECAST = "https://api.open-meteo.com/v1/forecast";

export interface ForecastPoint {
	latitude: number;
	longitude: number;
	/** Metres. Forecast is corrected to this height (mountain point, D-012). null → model cell height. */
	elevation: number | null;
}

/** Open-Meteo reads `nan` as "use the model cell height". */
const elevationParam = (e: number | null) => (e === null ? "nan" : String(e));

/** Hourly forecast for several points in one call; one series per point, same order. */
export function fetchForecast(
	points: readonly ForecastPoint[],
	fields: readonly string[],
	range: UtcHourRange,
): Promise<UtcHourlySeries[]> {
	const url = buildUrl(URL_FORECAST, {
		latitude: points.map((p) => p.latitude).join(","),
		longitude: points.map((p) => p.longitude).join(","),
		elevation: points.map((p) => elevationParam(p.elevation)).join(","),
		hourly: fields.join(","),
		timezone: UTC,
		start_hour: range.start,
		end_hour: range.end,
	});
	return getJson("forecast", url, oneOrMany(hourlyResponse(fields)));
}
