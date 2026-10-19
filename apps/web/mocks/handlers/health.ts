import { HttpResponse } from "msw";
import { api } from "../api.ts";

export const healthHandlers = [
	api.query("Health", () =>
		HttpResponse.json({ data: { health: { status: "ok" } } }),
	),
];
