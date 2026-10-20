export type UpstreamService = "geocoding" | "forecast" | "marine" | "elevation";

/** Why a call failed. "status" = HTTP error; `reason` is Open-Meteo's own text, if any. */
export type UpstreamFailure = "timeout" | "network" | "status" | "shape";

/** An Open-Meteo call failed. Knows nothing about GraphQL; resolvers map it. */
export class UpstreamError extends Error {
	readonly service: UpstreamService;
	readonly failure: UpstreamFailure;
	readonly status: number | null;
	readonly reason: string | null;

	constructor(
		service: UpstreamService,
		failure: UpstreamFailure,
		details: { status?: number; reason?: string; cause?: unknown } = {},
	) {
		const status = details.status ?? null;
		const reason = details.reason ?? null;
		super(
			`Open-Meteo ${service}: ${failure}${status ? ` ${status}` : ""}${reason ? ` (${reason})` : ""}`,
			{ cause: details.cause },
		);
		this.name = "UpstreamError";
		this.service = service;
		this.failure = failure;
		this.status = status;
		this.reason = reason;
	}
}
