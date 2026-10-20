import { z } from "zod";
import { env } from "@/env.ts";
import {
	UpstreamError,
	type UpstreamService,
} from "@/features/openMeteo/client/upstreamError.ts";

// Open-Meteo error body: {"error": true, "reason": "..."}.
const errorBody = z.object({ reason: z.string() });

const isTimeout = (error: unknown) =>
	error instanceof DOMException && error.name === "TimeoutError";

async function readReason(response: Response): Promise<string | undefined> {
	try {
		return errorBody.parse(await response.json()).reason;
	} catch {
		return undefined;
	}
}

/**
 * GET an Open-Meteo URL and validate the JSON with `schema`.
 * Every failure (timeout, network, HTTP error, unexpected shape) → UpstreamError.
 */
export async function getJson<T>(
	service: UpstreamService,
	url: URL,
	schema: z.ZodType<T>,
): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, {
			signal: AbortSignal.timeout(env.OPEN_METEO_TIMEOUT_MS),
		});
	} catch (cause) {
		throw new UpstreamError(service, isTimeout(cause) ? "timeout" : "network", {
			cause,
		});
	}

	if (!response.ok) {
		throw new UpstreamError(service, "status", {
			status: response.status,
			reason: await readReason(response),
		});
	}

	let body: unknown;
	try {
		body = await response.json();
	} catch (cause) {
		// The timeout also covers reading the body.
		throw new UpstreamError(service, isTimeout(cause) ? "timeout" : "shape", {
			cause,
		});
	}
	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		throw new UpstreamError(service, "shape", {
			reason: z.prettifyError(parsed.error),
		});
	}
	return parsed.data;
}

/** URL with query params; `undefined` params are left out. */
export function buildUrl(
	base: string,
	params: Record<string, string | number | undefined>,
): URL {
	const url = new URL(base);
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) url.searchParams.set(key, String(value));
	}
	return url;
}
