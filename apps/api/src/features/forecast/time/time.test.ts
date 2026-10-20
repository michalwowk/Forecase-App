import { describe, expect, it } from "vitest";
import {
	fetchRange,
	formatUtc,
	localToday,
	localToUtc,
	toLocalSeries,
	utcToLocal,
} from "@/features/forecast/time/time.ts";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";

const VIENNA = "Europe/Vienna";
// CEST → CET on 2026-10-25 at 03:00 local (01:00 UTC).

describe("UTC ↔ local", () => {
	it("converts with the offset valid on that day (DST)", () => {
		expect(utcToLocal("2026-10-24T07:00", VIENNA)).toBe("2026-10-24T09:00");
		expect(utcToLocal("2026-10-26T08:00", VIENNA)).toBe("2026-10-26T09:00");
	});

	it("repeats the fall-back hour", () => {
		expect(utcToLocal("2026-10-25T00:00", VIENNA)).toBe("2026-10-25T02:00");
		expect(utcToLocal("2026-10-25T01:00", VIENNA)).toBe("2026-10-25T02:00");
	});

	it("skips the spring-forward hour", () => {
		// CET → CEST on 2026-03-29 at 02:00 local (01:00 UTC): 02:00 never happens.
		expect(utcToLocal("2026-03-29T00:00", VIENNA)).toBe("2026-03-29T01:00");
		expect(utcToLocal("2026-03-29T01:00", VIENNA)).toBe("2026-03-29T03:00");
	});

	it("keeps half-hour offsets", () => {
		expect(utcToLocal("2026-10-20T04:00", "Asia/Kolkata")).toBe(
			"2026-10-20T09:30",
		);
	});

	it("local hour → UTC, both sides of the switch", () => {
		expect(formatUtc(localToUtc("2026-10-24", 9, VIENNA))).toBe(
			"2026-10-24T07:00",
		);
		expect(formatUtc(localToUtc("2026-10-26", 9, VIENNA))).toBe(
			"2026-10-26T08:00",
		);
		expect(formatUtc(localToUtc("2026-10-26", 24, VIENNA))).toBe(
			"2026-10-26T23:00",
		);
	});

	it("today is the place's date, not the server's", () => {
		const now = new Date("2026-10-20T23:30:00Z");
		expect(localToday(now, VIENNA)).toBe("2026-10-21");
		expect(localToday(now, "America/New_York")).toBe("2026-10-20");
	});
});

describe("fetchRange", () => {
	it("covers overnight snow before day 1 to the latest window end on day 7", () => {
		// Day 1 = 2026-10-21. Ski fresh snow from 16:00 on 2026-10-20 (CEST, −2 h).
		// Day 7 = 2026-10-27, indoor ends 20:00 (CET, −1 h) → last hour 18:00 UTC.
		expect(fetchRange("2026-10-20", VIENNA, defaultConfig)).toEqual({
			start: "2026-10-20T14:00",
			end: "2026-10-27T18:00",
		});
	});
});

describe("toLocalSeries", () => {
	it("keeps local window hours right after the switch", () => {
		const series = toLocalSeries(
			{
				time: ["2026-10-24T07:00", "2026-10-26T08:00"],
				fields: { x: [1, 2] },
			},
			VIENNA,
		);
		expect(series).toEqual({
			time: ["2026-10-24T09:00", "2026-10-26T09:00"],
			fields: { x: [1, 2] },
		});
	});
});
