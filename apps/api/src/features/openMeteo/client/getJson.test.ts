import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildUrl, getJson } from "@/features/openMeteo/client/getJson.ts";
import { UpstreamError } from "@/features/openMeteo/client/upstreamError.ts";
import { server } from "@/mocks/server.ts";

const URL_TEST = "https://api.open-meteo.com/v1/test";
const schema = z.object({ value: z.number() });

/** The UpstreamError a call rejects with. */
async function failure(): Promise<UpstreamError> {
	const error = await getJson("forecast", new URL(URL_TEST), schema).catch(
		(e: unknown) => e,
	);
	expect(error).toBeInstanceOf(UpstreamError);
	return error as UpstreamError;
}

describe("getJson", () => {
	it("returns the parsed body", async () => {
		server.use(http.get(URL_TEST, () => HttpResponse.json({ value: 1 })));
		await expect(
			getJson("forecast", new URL(URL_TEST), schema),
		).resolves.toEqual({ value: 1 });
	});

	it("5xx → status failure", async () => {
		server.use(
			http.get(URL_TEST, () => new HttpResponse(null, { status: 503 })),
		);
		expect(await failure()).toMatchObject({
			service: "forecast",
			failure: "status",
			status: 503,
			reason: null,
		});
	});

	it("4xx keeps Open-Meteo's reason", async () => {
		server.use(
			http.get(URL_TEST, () =>
				HttpResponse.json({ error: true, reason: "Bad" }, { status: 400 }),
			),
		);
		expect(await failure()).toMatchObject({ status: 400, reason: "Bad" });
	});

	it("network error → network failure", async () => {
		server.use(http.get(URL_TEST, () => HttpResponse.error()));
		expect((await failure()).failure).toBe("network");
	});

	it("slower than OPEN_METEO_TIMEOUT_MS → timeout failure", async () => {
		server.use(
			http.get(URL_TEST, async () => {
				await delay("infinite");
				return HttpResponse.json({ value: 1 });
			}),
		);
		expect((await failure()).failure).toBe("timeout");
	});

	it("unexpected shape → shape failure", async () => {
		server.use(http.get(URL_TEST, () => HttpResponse.json({ value: "x" })));
		expect((await failure()).failure).toBe("shape");
	});

	it("non-JSON body → shape failure", async () => {
		server.use(http.get(URL_TEST, () => HttpResponse.text("oops")));
		expect((await failure()).failure).toBe("shape");
	});
});

describe("buildUrl", () => {
	it("leaves out undefined params", () => {
		const url = buildUrl(URL_TEST, { a: 1, b: undefined, c: "x,y" });
		expect(url.searchParams.get("a")).toBe("1");
		expect(url.searchParams.has("b")).toBe(false);
		expect(url.searchParams.get("c")).toBe("x,y");
	});
});
