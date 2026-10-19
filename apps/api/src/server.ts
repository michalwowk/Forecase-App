import { NoSchemaIntrospectionCustomRule } from "graphql";
import { createYoga, type Plugin } from "graphql-yoga";
import { env } from "./env.ts";
import { logger } from "./logger.ts";
import { schema } from "./schema.ts";

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
