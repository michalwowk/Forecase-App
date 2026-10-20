import { describe, expect, it } from "vitest";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import { scoreWeek } from "@/features/scoring/scoreWeek.ts";
import {
	buildSeries,
	today,
	tomorrow,
} from "@/features/scoring/test/builders.ts";
import {
	ACTIVITIES,
	type Activity,
	type DayResult,
	type ScoreInput,
} from "@/features/scoring/types.ts";

// Acceptance criteria of docs/changes/0004-scoring-engine/spec.md on hand-built days.
// Expected numbers are worked out from defaultConfig in the comments.

const SERIES_DAYS = 9;

type Fields = Parameters<typeof buildSeries>[2];

/** Pleasant, dry, calm town day: outdoor 100. */
const niceTown: Fields = {
	precipitation: 0,
	precipitation_probability: 0,
	apparent_temperature: 21,
	temperature_2m: 21,
	sunshine_duration: 3600,
	wind_gusts_10m: 15,
	wind_speed_10m: 5,
	wind_direction_10m: 90,
	weather_code: 0,
};

/** Powder day on the mountain: skiing 100. */
const powderMountain: Fields = {
	snowfall: 1,
	snow_depth: 1,
	temperature_2m: -5,
	apparent_temperature: -8,
	wind_gusts_10m: 20,
	sunshine_duration: 3600,
	weather_code: 0,
};

/** Clean 1.5 m / 12 s swell: surfing 100 with light offshore wind. */
const goodMarine: Fields = {
	swell_wave_height: 1.5,
	swell_wave_period: 12,
	wind_wave_height: 0.2,
};

/** Base fields with `changes` on top; `null` = no series at all. */
function series(base: Fields, changes: Fields | null | undefined) {
	return changes === null
		? null
		: buildSeries(today, SERIES_DAYS, { ...base, ...changes });
}

/** Score a week of good days, with only the given fields changed. */
function week(
	changes: {
		town?: Fields;
		mountain?: Fields | null;
		marine?: Fields | null;
	} = {},
	config?: ScoringConfig,
) {
	const input: ScoreInput = {
		today,
		town: buildSeries(today, SERIES_DAYS, { ...niceTown, ...changes.town }),
		mountain: series(powderMountain, changes.mountain),
		marine: series(goodMarine, changes.marine),
		// Sea to the west; town wind blows from the east (land) → offshore.
		seaBearing: 270,
	};
	return scoreWeek(input, config);
}

function day(
	result: ReturnType<typeof scoreWeek>,
	activity: Activity,
	date = tomorrow,
): DayResult {
	const found = result.rows[activity].days.find((d) => d.date === date);
	if (!found) throw new Error(`no ${activity} day ${date}`);
	return found;
}

/** `value` tomorrow from hour `from` to `to` (excluded), `otherwise` everywhere else. */
function onlyTomorrow(hours: {
	value: number | null;
	otherwise: number | null;
	from: number;
	to: number;
}) {
	return (date: string, hour: number) =>
		date === tomorrow && hour >= hours.from && hour < hours.to
			? hours.value
			: hours.otherwise;
}

/** `value` at noon tomorrow only. */
const atNoonTomorrow = (value: number, otherwise: number) =>
	onlyTomorrow({ value, otherwise, from: 12, to: 13 });

describe("scoreWeek — week", () => {
	it("returns 7 days from tomorrow, same dates in every row", () => {
		const result = week();
		expect(result.days).toHaveLength(defaultConfig.week.length);
		expect(result.days[0]).toBe(tomorrow);
		for (const activity of ACTIVITIES) {
			expect(result.rows[activity].days.map((d) => d.date)).toEqual(
				result.days,
			);
		}
	});
});

describe("scoreWeek — skiing", () => {
	it("ideal powder day → Great", () => {
		const d = day(week(), "skiing");
		expect(d).toMatchObject({ state: "scored", score: 100, label: "Great" });
	});

	it("counts overnight snow from 16:00 the day before", () => {
		// Snow only outside 9–16: 8 h the evening before + 9 h of night = 17 cm.
		const d = day(
			week({ mountain: { snowfall: (_d, h) => (h < 9 || h >= 16 ? 1 : 0) } }),
			"skiing",
		);
		expect(d.keyValues).toContainEqual(
			expect.objectContaining({ metric: "freshSnow", value: 17 }),
		);
	});

	it("3 °C rain on a 5 cm base → Poor, capped by no snow base", () => {
		const d = day(
			week({ mountain: { snowfall: 0, snow_depth: 0.05, temperature_2m: 3 } }),
			"skiing",
		);
		expect(d.label).toBe("Poor");
		expect(d.score).toBeLessThanOrEqual(20);
		expect(d.reasons[0]).toBe("No snow base (5 cm)");
	});

	it("gusts 75 km/h on a powder day → ≤ 30, lifts likely closed", () => {
		const d = day(week({ mountain: { wind_gusts_10m: 75 } }), "skiing");
		expect(d.score).toBe(30);
		expect(d.reasons[0]).toBe("Lifts likely closed — gusts 75 km/h");
	});

	it("no mountain point → not applicable for the whole row", () => {
		const row = week({ mountain: null }).rows.skiing;
		expect(row.days.every((d) => d.state === "notApplicable")).toBe(true);
		expect(row.days[0]?.reasons).toEqual(["No mountains nearby"]);
		expect(row.bestDay).toBeNull();
	});
});

describe("scoreWeek — surfing", () => {
	it("1.5 m / 12 s / light offshore → Great", () => {
		const d = day(week({ town: { wind_speed_10m: 15 } }), "surfing");
		// 15 km/h offshore × 0.4 = 6 km/h effective → full wind score.
		expect(d).toMatchObject({ state: "scored", score: 100, label: "Great" });
	});

	it("onshore wind scores lower than the same wind offshore", () => {
		const offshore = day(week({ town: { wind_speed_10m: 25 } }), "surfing");
		const onshore = day(
			week({ town: { wind_speed_10m: 25, wind_direction_10m: 270 } }),
			"surfing",
		);
		expect(onshore.score ?? 0).toBeLessThan(offshore.score ?? 0);
	});

	it("swell 3.5 m → ≤ 30, too big for most surfers", () => {
		const d = day(week({ marine: { swell_wave_height: 3.5 } }), "surfing");
		expect(d.score).toBeLessThanOrEqual(30);
		expect(d.reasons[0]).toBe("Too big for most surfers (3.5 m)");
	});

	it("all-null or missing marine → not applicable", () => {
		const allNull = week({
			marine: {
				swell_wave_height: null,
				swell_wave_period: null,
				wind_wave_height: null,
			},
		});
		for (const result of [allNull, week({ marine: null })]) {
			const row = result.rows.surfing;
			expect(row.days.every((d) => d.state === "notApplicable")).toBe(true);
			expect(row.days[0]?.reasons).toEqual(["No sea near this place"]);
		}
	});
});

describe("scoreWeek — outdoor and indoor", () => {
	it("sunny 21 °C dry → outdoor Great, indoor at its floor (40, Fair)", () => {
		const result = week();
		expect(day(result, "outdoor")).toMatchObject({
			score: 100,
			label: "Great",
		});
		expect(day(result, "indoor")).toMatchObject({ score: 40, label: "Fair" });
	});

	it("12 mm rain → outdoor ≤ 25 with the heavy-rain reason first", () => {
		const d = day(week({ town: { precipitation: 1.5 } }), "outdoor");
		expect(d.score).toBeLessThanOrEqual(25);
		expect(d.reasons[0]).toBe("Heavy rain 12 mm");
	});

	it("4 mm rain, 0 °C, no sun → indoor Great", () => {
		// Indoor window 10–20 = 10 h → 0.4 mm/h = 4 mm.
		// rain 79.2×0.35 + chance 100×0.1 + feels 100×0.25 + sun 100×0.2 + gusts 0 = 82.7
		// → 40 + 0.6 × 82.7 = 89.6 → 90.
		const d = day(
			week({
				town: {
					precipitation: 0.4,
					precipitation_probability: 90,
					apparent_temperature: 0,
					sunshine_duration: 0,
					wind_gusts_10m: 20,
				},
			}),
			"indoor",
		);
		expect(d).toMatchObject({ score: 90, label: "Great" });
	});

	it("15 mm rain → indoor capped at 70: rough trip there", () => {
		const d = day(
			week({
				town: {
					precipitation: 1.5,
					precipitation_probability: 90,
					apparent_temperature: 10,
					sunshine_duration: 0,
				},
			}),
			"indoor",
		);
		expect(d.score).toBe(70);
		expect(d.reasons[0]).toBe("Rough trip there: heavy rain 15 mm");
	});
});

describe("scoreWeek — unsafe", () => {
	const cases: [string, Fields, string][] = [
		[
			"hail storm",
			{ weather_code: atNoonTomorrow(96, 0) },
			"Hail storm expected — stay home",
		],
		[
			"violent gusts",
			{ wind_gusts_10m: atNoonTomorrow(105, 15) },
			"Violent gusts up to 105 km/h — stay home",
		],
		[
			"extreme heat",
			{ apparent_temperature: atNoonTomorrow(41, 21) },
			"Extreme heat, feels like 41 °C — stay home",
		],
		[
			"extreme cold",
			{ apparent_temperature: atNoonTomorrow(-26, 21) },
			"Extreme cold, feels like -26 °C — stay home",
		],
	];

	it.each(cases)(
		"%s in town → unsafe for every town activity",
		(_n, town, reason) => {
			const result = week({ town });
			for (const activity of ["outdoor", "indoor", "surfing"] as const) {
				expect(day(result, activity)).toMatchObject({
					state: "unsafe",
					score: null,
					reasons: [reason],
				});
			}
			// Skiing reads the mountain point, which is calm.
			expect(day(result, "skiing").state).toBe("scored");
			// Only tomorrow is hit.
			expect(day(result, "outdoor", "2026-10-22").state).toBe("scored");
		},
	);

	it("skiing checks the mountain point", () => {
		const d = day(week({ mountain: { apparent_temperature: -26 } }), "skiing");
		expect(d.state).toBe("unsafe");
	});
});

describe("scoreWeek — missing data", () => {
	it("key metric under 75 % of window hours → no data", () => {
		// Rain missing 10–13 tomorrow: outdoor 5/8, indoor 7/10 → both below 0.75.
		const result = week({
			town: {
				precipitation: onlyTomorrow({
					value: null,
					otherwise: 0,
					from: 10,
					to: 13,
				}),
			},
		});
		expect(day(result, "outdoor")).toMatchObject({
			state: "noData",
			reasons: ["Missing forecast data: Rain"],
		});
		expect(day(result, "indoor").state).toBe("noData");
		expect(day(result, "outdoor", "2026-10-22").state).toBe("scored");
	});

	it("missing helper metric → scored, weights renormalised", () => {
		// Feels 9 °C → sub 50. With sun: 35 + 10 + 12.5 + 20 + 10 = 87.5 → 88.
		// Without sun (weight 0.2 dropped): (35 + 10 + 12.5 + 10) / 0.8 = 84.4 → 84.
		const withSun = day(week({ town: { apparent_temperature: 9 } }), "outdoor");
		const noSun = day(
			week({ town: { apparent_temperature: 9, sunshine_duration: null } }),
			"outdoor",
		);
		expect(withSun.score).toBe(88);
		expect(noSun).toMatchObject({ state: "scored", score: 84 });
		expect(noSun.keyValues.map((k) => k.metric)).not.toContain("sunshine");
	});

	it("days past the end of the data → no data", () => {
		const short = scoreWeek({
			today,
			town: buildSeries(today, 3, niceTown),
			mountain: null,
			marine: null,
			seaBearing: null,
		});
		expect(day(short, "outdoor", "2026-10-22").state).toBe("scored");
		expect(day(short, "outdoor", "2026-10-23").state).toBe("noData");
	});
});

describe("scoreWeek — reasons and best day", () => {
	it("every scored day has 1–3 reasons", () => {
		const result = week({ town: { precipitation: 1.5 } });
		for (const activity of ACTIVITIES) {
			for (const d of result.rows[activity].days) {
				expect(d.reasons.length).toBeGreaterThanOrEqual(1);
				expect(d.reasons.length).toBeLessThanOrEqual(defaultConfig.reasons.max);
			}
		}
	});

	it("best day: highest score, earliest on a tie", () => {
		const tie = week();
		expect(tie.rows.outdoor.bestDay).toBe(tomorrow);
		const later = week({
			town: { precipitation: (d) => (d === "2026-10-24" ? 0 : 0.5) },
		});
		expect(later.rows.outdoor.bestDay).toBe("2026-10-24");
	});

	it("best day below Fair → none", () => {
		const result = week({ town: { precipitation: 1.5 } });
		expect(day(result, "outdoor").label).toBe("Poor");
		expect(result.rows.outdoor.bestDay).toBeNull();
	});
});

describe("scoreWeek — config drives the result", () => {
	it("raising the heavy-rain cap threshold lifts the 12 mm day", () => {
		const config = structuredClone(defaultConfig);
		const cap = config.activities.outdoor.caps[0];
		if (cap?.kind !== "metric") throw new Error("expected heavy-rain cap");
		cap.value = 15;
		// Uncapped: rain 0 + chance 10 + feels 25 + sun 20 + gusts 10 = 65.
		const d = day(week({ town: { precipitation: 1.5 } }, config), "outdoor");
		expect(d.score).toBe(65);
	});
});
