import { describe, expect, it } from "vitest";
import { parseEnv } from "@/env.ts";

describe("parseEnv", () => {
	it("uses defaults when nothing is set", () => {
		expect(parseEnv({})).toEqual({ APP_MODE: "production", PORT: 4000 });
	});

	it("reads valid values", () => {
		expect(parseEnv({ APP_MODE: "production", PORT: "8080" })).toEqual({
			APP_MODE: "production",
			PORT: 8080,
		});
	});

	it("rejects a non-numeric PORT", () => {
		expect(() => parseEnv({ PORT: "abc" })).toThrow(/PORT/);
	});

	it("rejects an unknown APP_MODE", () => {
		expect(() => parseEnv({ APP_MODE: "staging" })).toThrow(/APP_MODE/);
	});
});
