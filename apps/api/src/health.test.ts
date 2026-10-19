import { describe, expect, it } from "vitest";
import { createApp } from "./server.ts";

describe("health query", () => {
	it("returns ok over HTTP", async () => {
		const app = createApp();
		const response = await app.fetch("http://localhost/graphql", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ query: "{ health { status } }" }),
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			data: { health: { status: "ok" } },
		});
	});
});
