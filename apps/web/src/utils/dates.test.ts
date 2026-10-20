import { describe, expect, it } from "vitest";
import { formatDayLong, formatDayShort } from "@/utils/dates.ts";

describe("dates", () => {
	it("formats the grid header", () => {
		expect(formatDayShort("2026-10-21")).toBe("Wed 21");
	});

	it("formats the detail heading", () => {
		expect(formatDayLong("2026-10-21")).toBe("Wed 21 Oct");
	});

	it("keeps the calendar day at the year edge", () => {
		expect(formatDayLong("2027-01-01")).toBe("Fri 1 Jan");
	});
});
