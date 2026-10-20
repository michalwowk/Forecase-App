import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { FIXTURE_PLACES, fixture, URLS } from "@/mocks/handlers/open-meteo.ts";
import { server } from "@/mocks/server.ts";
import { errorCodes, execute } from "@/test/graphql.ts";

// Fixtures recorded 2026-10-20T17:52Z (mocks/fixtures/open-meteo/README.md): week 21–27 Oct.

const FORECAST = /* GraphQL */ `
	query Forecast($id: ID!) {
		forecast(placeId: $id) {
			place { id name region country }
			activities {
				activity
				available
				dataElevation
				bestDay
				days { date state score label reasons keyValues { label value unit } }
			}
		}
	}
`;

interface Day {
	date: string;
	state: string;
	score: number | null;
	label: string | null;
	reasons: string[];
}
interface Row {
	activity: string;
	available: boolean;
	dataElevation: number | null;
	bestDay: string | null;
	days: Day[];
}
interface Result {
	forecast: {
		place: { id: string; name: string; region: string; country: string };
		activities: Row[];
	} | null;
}

const WEEK = [
	"2026-10-21",
	"2026-10-22",
	"2026-10-23",
	"2026-10-24",
	"2026-10-25",
	"2026-10-26",
	"2026-10-27",
];

/** Forecast by fixture name, or by a raw id for the unknown-id cases. */
async function forecastFor(place: keyof typeof FIXTURE_PLACES | string) {
	const id =
		place in FIXTURE_PLACES
			? String(FIXTURE_PLACES[place as keyof typeof FIXTURE_PLACES])
			: place;
	const result = await execute<Result>(FORECAST, { id });
	const row = (activity: string) =>
		result.data?.forecast?.activities.find((a) => a.activity === activity);
	return { result, row };
}

const states = (row: Row | undefined) => row?.days.map((d) => d.state);
const allNotApplicable = Array(7).fill("NOT_APPLICABLE");

describe("forecast on recorded data", () => {
	it("Innsbruck: place, 4 rows of 7 days from tomorrow, skiing at the 2500 m cap, no sea", async () => {
		const { result, row } = await forecastFor("innsbruck");
		expect(result.errors).toBeUndefined();
		const forecast = result.data?.forecast;
		expect(forecast?.place).toEqual({
			id: "2775220",
			name: "Innsbruck",
			region: "Tyrol",
			country: "Austria",
		});
		for (const activity of forecast?.activities ?? []) {
			expect(activity.days.map((d) => d.date)).toEqual(WEEK);
		}
		expect(forecast?.activities.map((a) => a.activity)).toEqual([
			"SKIING",
			"SURFING",
			"OUTDOOR",
			"INDOOR",
		]);

		const skiing = row("SKIING");
		expect(skiing?.dataElevation).toBe(2500);
		expect(skiing?.days.every((d) => d.state === "SCORED")).toBe(true);
		expect(states(row("SURFING"))).toEqual(allNotApplicable);
	});

	it("Kraków: no mountains, no sea", async () => {
		const { row } = await forecastFor("krakow");
		expect(states(row("SKIING"))).toEqual(allNotApplicable);
		expect(row("SKIING")?.dataElevation).toBeNull();
		expect(row("SKIING")?.days[0]?.reasons).toEqual(["No mountains nearby"]);
		expect(states(row("SURFING"))).toEqual(allNotApplicable);
		expect(row("OUTDOOR")?.days.every((d) => d.state === "SCORED")).toBe(true);
	});

	it("Nazaré: surfing scored every day (marine hours match the town's)", async () => {
		const { row } = await forecastFor("nazare");
		const surfing = row("SURFING");
		expect(surfing?.available).toBe(true);
		expect(surfing?.days.every((d) => d.state === "SCORED")).toBe(true);
		expect(states(row("SKIING"))).toEqual(allNotApplicable);

		const marine = fixture("nazare", "marine") as {
			hourly: { time: string[] };
		};
		// One point (no mountain) → Open-Meteo returns an object, not a list.
		const town = fixture("nazare", "forecast") as {
			hourly: { time: string[] };
		};
		expect(marine.hourly.time).toEqual(town.hourly.time);
	});

	it("Zakopane: skiing applicable, below the cap", async () => {
		const { row } = await forecastFor("zakopane");
		const skiing = row("SKIING");
		expect(skiing?.dataElevation).toBeGreaterThanOrEqual(1000);
		expect(skiing?.dataElevation).toBeLessThan(2500);
		expect(skiing?.days.every((d) => d.state !== "NOT_APPLICABLE")).toBe(true);
	});

	it("best day is the date of the row's top score", async () => {
		const { row } = await forecastFor("innsbruck");
		const outdoor = row("OUTDOOR");
		expect(outdoor?.bestDay).not.toBeNull();
		const max = Math.max(...(outdoor?.days.map((d) => d.score ?? 0) ?? []));
		const best = outdoor?.days.find((d) => d.date === outdoor.bestDay);
		expect(best?.score).toBe(max);
	});
});

describe("Open-Meteo requests", () => {
	it("all in UTC; hours cover the local week across the DST switch", async () => {
		const requests: URL[] = [];
		server.events.on("request:start", ({ request }) => {
			requests.push(new URL(request.url));
		});
		await forecastFor("innsbruck");
		server.events.removeAllListeners();

		const timed = requests.filter((u) => u.searchParams.has("hourly"));
		expect(timed.map((u) => u.hostname).sort()).toEqual([
			"api.open-meteo.com",
			"marine-api.open-meteo.com",
		]);
		for (const url of timed) {
			expect(url.searchParams.get("timezone")).toBe("GMT");
			// 16:00 CEST on 20 Oct → 14:00 UTC; 20:00 CET on 27 Oct, last hour 19:00 → 18:00 UTC.
			expect(url.searchParams.get("start_hour")).toBe("2026-10-20T14:00");
			expect(url.searchParams.get("end_hour")).toBe("2026-10-27T18:00");
		}
	});
});

describe("unknown place", () => {
	it.each(["999999999", "abc", "02775220", "99999999999"])(
		"placeId %s → null",
		async (id) => {
			const { result } = await forecastFor(id);
			expect(result).toEqual({ data: { forecast: null } });
		},
	);

	it("Geocoding down → UPSTREAM_UNAVAILABLE", async () => {
		server.use(http.get(URLS.get, () => HttpResponse.error()));
		const { result } = await forecastFor("innsbruck");
		expect(result.data).toEqual({ forecast: null });
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
	});
});

describe("failures", () => {
	it("Marine down → surfing unavailable, rest scored", async () => {
		server.use(
			http.get(URLS.marine, () => new HttpResponse(null, { status: 500 })),
		);
		const { result, row } = await forecastFor("nazare");
		expect(result.errors).toBeUndefined();
		expect(row("SURFING")).toMatchObject({
			available: false,
			days: [],
			bestDay: null,
		});
		expect(row("OUTDOOR")?.available).toBe(true);
		expect(row("OUTDOOR")?.days).toHaveLength(7);
	});

	it("Elevation down → skiing unavailable, surfing still scored (speed-only wind)", async () => {
		server.use(http.get(URLS.elevation, () => HttpResponse.error()));
		const { result, row } = await forecastFor("nazare");
		expect(result.errors).toBeUndefined();
		expect(row("SKIING")).toMatchObject({
			available: false,
			days: [],
			dataElevation: null,
		});
		expect(row("SURFING")?.days.every((d) => d.state === "SCORED")).toBe(true);
	});

	it("Forecast down → forecast null, UPSTREAM_UNAVAILABLE", async () => {
		server.use(
			http.get(URLS.forecast, () => new HttpResponse(null, { status: 503 })),
		);
		const { result } = await forecastFor("innsbruck");
		expect(result.data).toEqual({ forecast: null });
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
		expect(result.errors?.[0]?.path).toEqual(["forecast"]);
	});

	it("Forecast timeout → UPSTREAM_UNAVAILABLE", async () => {
		server.use(
			http.get(URLS.forecast, async () => {
				await delay("infinite");
				return HttpResponse.json({});
			}),
		);
		const { result } = await forecastFor("innsbruck");
		expect(result.data?.forecast).toBeNull();
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
	});

	it("Forecast without the mountain series → UPSTREAM_UNAVAILABLE, not 'not applicable'", async () => {
		const [town] = fixture("innsbruck", "forecast") as unknown[];
		server.use(http.get(URLS.forecast, () => HttpResponse.json(town as never)));
		const { result } = await forecastFor("innsbruck");
		expect(result.data?.forecast).toBeNull();
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
	});

	it("Forecast with an unexpected shape → UPSTREAM_UNAVAILABLE", async () => {
		server.use(
			http.get(URLS.forecast, () => HttpResponse.json([{ hourly: {} }])),
		);
		const { result } = await forecastFor("innsbruck");
		expect(errorCodes(result)).toEqual(["UPSTREAM_UNAVAILABLE"]);
	});
});
