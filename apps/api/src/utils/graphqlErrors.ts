import { GraphQLError } from "graphql";
import { UpstreamError } from "@/features/openMeteo/client/upstreamError.ts";
import { logger } from "@/logger.ts";

// Error codes clients can rely on (`extensions.code`). Other errors are masked in production.

export function badUserInput(message: string): GraphQLError {
	return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

/** UpstreamError → UPSTREAM_UNAVAILABLE; anything else is rethrown as is. */
export function toGraphQLError(error: unknown): never {
	if (error instanceof UpstreamError) {
		logger.warn({ err: error }, "upstream failure");
		throw new GraphQLError("Weather service temporarily unavailable", {
			extensions: { code: "UPSTREAM_UNAVAILABLE", service: error.service },
		});
	}
	throw error;
}
