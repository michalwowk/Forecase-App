import { HttpResponse } from "msw";
import { api } from "@/mocks/api.ts";

export const healthHandlers = [
	api.query("Health", () =>
		HttpResponse.json({ data: { health: { status: "ok" } } }),
	),
];
