import { NoSchemaIntrospectionCustomRule } from "graphql";
import { createYoga, type Plugin } from "graphql-yoga";
import { env } from "#src/env.ts";
import { logger } from "#src/logger.ts";
import { schema } from "#src/schema.ts";

const isProduction = env.APP_MODE === "production";

const disableIntrospection: Plugin = {
	onValidate({ addValidationRule }) {
		addValidationRule(NoSchemaIntrospectionCustomRule);
	},
};

export function createApp() {
	return createYoga({
		schema,
		logging: logger,
		graphiql: !isProduction,
		landingPage: false,
		maskedErrors: isProduction,
		plugins: isProduction ? [disableIntrospection] : [],
	});
}
