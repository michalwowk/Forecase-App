import { expect, it } from "vitest";

it("fails any outbound request without an MSW handler", async () => {
	await expect(fetch("https://unmocked.example.com/")).rejects.toThrow();
});
