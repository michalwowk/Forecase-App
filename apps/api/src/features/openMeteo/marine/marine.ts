import { buildUrl, getJson } from "@/features/openMeteo/client/getJson.ts";
import {
	hourlyResponse,
	UTC,
	type UtcHourlySeries,
	type UtcHourRange,
} from "@/features/openMeteo/client/hourly.ts";

const URL_MARINE = "https://marine-api.open-meteo.com/v1/marine";

/** Hourly marine data at one point. Inland → HTTP 200 with every value null. */
export function fetchMarine(
	point: { latitude: number; longitude: number },
	fields: readonly string[],
	range: UtcHourRange,
): Promise<UtcHourlySeries> {
	const url = buildUrl(URL_MARINE, {
		latitude: point.latitude,
		longitude: point.longitude,
		hourly: fields.join(","),
		timezone: UTC,
		start_hour: range.start,
		end_hour: range.end,
	});
	return getJson("marine", url, hourlyResponse(fields));
}
