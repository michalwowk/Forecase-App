import { describe, expect, it } from "vitest";
import { FORECAST_FIELDS, MARINE_FIELDS } from "@/features/forecast/fields.ts";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";

describe("fetched fields", () => {
	it("cover every field the scoring config reads", () => {
		const { surfWind } = defaultConfig;
		const read = new Set([
			...Object.values(defaultConfig.activities).flatMap((a) => [
				...a.metrics.map((m) => m.field),
				...a.caps.flatMap((c) => ("field" in c ? [c.field] : [])),
			]),
			...defaultConfig.unsafe.map((u) => u.field),
			surfWind.speedField,
			surfWind.directionField,
		]);
		read.delete(surfWind.field); // computed, not fetched

		const fetched = new Set<string>([...FORECAST_FIELDS, ...MARINE_FIELDS]);
		expect([...read].filter((f) => !fetched.has(f))).toEqual([]);
	});
});
