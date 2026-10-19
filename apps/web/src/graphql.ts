import { env } from "./env.ts";
import type { TypedDocumentString } from "./generated/graphql.ts";

export async function request<TResult, TVariables>(
	document: TypedDocumentString<TResult, TVariables>,
	variables?: TVariables,
): Promise<TResult> {
	const url = new URL(env.VITE_API_URL, window.location.origin);
	const response = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ query: document.toString(), variables }),
	});
	if (!response.ok) {
		throw new Error(`API responded with ${response.status}`);
	}
	const body = (await response.json()) as {
		data?: TResult;
		errors?: { message: string }[];
	};
	if (body.errors?.length || !body.data) {
		throw new Error(body.errors?.[0]?.message ?? "Empty API response");
	}
	return body.data;
}
