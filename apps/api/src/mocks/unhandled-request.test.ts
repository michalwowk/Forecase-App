import { expect, it } from "vitest";

it("fails any outbound request without an MSW handler", async () => {
	await expect(
		fetch("https://api.open-meteo.com/v1/forecast"),
	).rejects.toThrow();
});
