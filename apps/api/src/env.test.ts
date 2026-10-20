import { describe, expect, it } from "vitest";
import { parseEnv } from "@/env.ts";

describe("parseEnv", () => {
	it("uses defaults when nothing is set", () => {
		expect(parseEnv({})).toEqual({
			APP_MODE: "production",
			PORT: 4000,
			OPEN_METEO_TIMEOUT_MS: 5000,
		});
	});

	it("reads valid values", () => {
		expect(parseEnv({ APP_MODE: "production", PORT: "8080" })).toEqual({
			APP_MODE: "production",
			PORT: 8080,
			OPEN_METEO_TIMEOUT_MS: 5000,
		});
	});

	it("reads OPEN_METEO_TIMEOUT_MS", () => {
		expect(parseEnv({ OPEN_METEO_TIMEOUT_MS: "800" })).toMatchObject({
			OPEN_METEO_TIMEOUT_MS: 800,
		});
	});

	it("rejects a non-positive OPEN_METEO_TIMEOUT_MS", () => {
		expect(() => parseEnv({ OPEN_METEO_TIMEOUT_MS: "0" })).toThrow(
			/OPEN_METEO_TIMEOUT_MS/,
		);
	});

	it("rejects a non-numeric PORT", () => {
		expect(() => parseEnv({ PORT: "abc" })).toThrow(/PORT/);
	});

	it("rejects an unknown APP_MODE", () => {
		expect(() => parseEnv({ APP_MODE: "staging" })).toThrow(/APP_MODE/);
	});
});
