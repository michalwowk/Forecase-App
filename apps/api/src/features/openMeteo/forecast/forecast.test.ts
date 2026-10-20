import { HttpResponse, http, type JsonBodyType } from "msw";
import { describe, expect, it } from "vitest";
import { fetchElevations } from "@/features/openMeteo/elevation/elevation.ts";
import { fetchForecast } from "@/features/openMeteo/forecast/forecast.ts";
import { fetchMarine } from "@/features/openMeteo/marine/marine.ts";
import { server } from "@/mocks/server.ts";

const URL_FORECAST = "https://api.open-meteo.com/v1/forecast";
const URL_MARINE = "https://marine-api.open-meteo.com/v1/marine";
const URL_ELEVATION = "https://api.open-meteo.com/v1/elevation";

const range = { start: "2026-10-20T14:00", end: "2026-10-20T15:00" };
const point = { latitude: 47.26, longitude: 11.39 };
const time = ["2026-10-20T14:00", "2026-10-20T15:00"];
const hourly = (temperature_2m: (number | null)[]) => ({
	hourly: { time, temperature_2m },
});

/** Captures the query of the last request to `url`, answering with `body`. */
function capture(url: string, body: JsonBodyType) {
	const seen: { params?: URLSearchParams } = {};
	server.use(
		http.get(url, ({ request }) => {
			seen.params = new URL(request.url).searchParams;
			return HttpResponse.json(body);
		}),
	);
	return seen;
}

describe("fetchForecast", () => {
	it("asks for UTC hours, several points and their elevations", async () => {
		const seen = capture(URL_FORECAST, [hourly([1, 2]), hourly([3, null])]);

		const series = await fetchForecast(
			[
				{ ...point, elevation: 570 },
				{ latitude: 47.3, longitude: 11.38, elevation: 2500 },
			],
			["temperature_2m"],
			range,
		);

		expect(series).toEqual([
			{ time, fields: { temperature_2m: [1, 2] } },
			{ time, fields: { temperature_2m: [3, null] } },
		]);
		expect(Object.fromEntries(seen.params ?? [])).toEqual({
			latitude: "47.26,47.3",
			longitude: "11.39,11.38",
			elevation: "570,2500",
			hourly: "temperature_2m",
			timezone: "GMT",
			start_hour: range.start,
			end_hour: range.end,
		});
	});

	it("wraps a single-point object in a list", async () => {
		capture(URL_FORECAST, hourly([1, 2]));
		const series = await fetchForecast(
			[{ ...point, elevation: 570 }],
			["temperature_2m"],
			range,
		);
		expect(series).toHaveLength(1);
	});

	it("rejects a missing field or a length mismatch", async () => {
		capture(URL_FORECAST, { hourly: { time } });
		await expect(
			fetchForecast([{ ...point, elevation: 0 }], ["temperature_2m"], range),
		).rejects.toMatchObject({ failure: "shape" });

		capture(URL_FORECAST, hourly([1]));
		await expect(
			fetchForecast([{ ...point, elevation: 0 }], ["temperature_2m"], range),
		).rejects.toMatchObject({ failure: "shape" });
	});
});

describe("fetchMarine", () => {
	it("asks for UTC hours and keeps all-null (inland) data", async () => {
		const seen = capture(URL_MARINE, hourly([null, null]));
		const series = await fetchMarine(point, ["temperature_2m"], range);
		expect(series.fields.temperature_2m).toEqual([null, null]);
		expect(seen.params?.get("timezone")).toBe("GMT");
		expect(seen.params?.get("start_hour")).toBe(range.start);
		expect(seen.params?.get("end_hour")).toBe(range.end);
	});
});

describe("fetchElevations", () => {
	it("returns one height per point", async () => {
		const seen = capture(URL_ELEVATION, { elevation: [584, 0] });
		await expect(fetchElevations([point, point])).resolves.toEqual([584, 0]);
		expect(seen.params?.get("latitude")).toBe("47.26,47.26");
	});

	it("rejects a count mismatch", async () => {
		capture(URL_ELEVATION, { elevation: [584] });
		await expect(fetchElevations([point, point])).rejects.toMatchObject({
			failure: "shape",
		});
	});
});
