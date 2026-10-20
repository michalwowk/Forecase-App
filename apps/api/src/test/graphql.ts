import { RECORDED_AT } from "@/mocks/handlers/open-meteo.ts";
import { createApp } from "@/server.ts";

export interface GraphQLResult<T> {
	data?: T | null;
	errors?: {
		message: string;
		path?: string[];
		extensions?: { code?: string };
	}[];
}

/** Runs a query over HTTP against the app, with the clock fixed to the fixtures' recording time. */
export async function execute<T = Record<string, unknown>>(
	query: string,
	variables: Record<string, unknown> = {},
	now: Date = RECORDED_AT,
): Promise<GraphQLResult<T>> {
	const app = createApp({ now: () => now });
	const response = await app.fetch("http://localhost/graphql", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ query, variables }),
	});
	return (await response.json()) as GraphQLResult<T>;
}

/** `extensions.code` of every error. */
export const errorCodes = (result: GraphQLResult<unknown>) =>
	(result.errors ?? []).map((e) => e.extensions?.code);
