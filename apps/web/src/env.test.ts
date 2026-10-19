import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.ts";

describe("parseEnv", () => {
	it("defaults the API URL to the dev proxy", () => {
		expect(parseEnv({})).toEqual({ VITE_API_URL: "/graphql" });
	});

	it("rejects an empty API URL", () => {
		expect(() => parseEnv({ VITE_API_URL: "" })).toThrow(/VITE_API_URL/);
	});
});
