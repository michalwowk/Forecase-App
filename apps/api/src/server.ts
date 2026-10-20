import { NoSchemaIntrospectionCustomRule } from "graphql";
import { createYoga, type Plugin } from "graphql-yoga";
import {
	type GraphQLContext,
	MAX_FORECASTS_PER_REQUEST,
} from "@/context/graphqlContext.ts";
import { env } from "@/env.ts";
import { logger } from "@/logger.ts";
import { schema } from "@/schema.ts";

const isProduction = env.APP_MODE === "production";

const disableIntrospection: Plugin = {
	onValidate({ addValidationRule }) {
		addValidationRule(NoSchemaIntrospectionCustomRule);
	},
};

export interface AppOptions {
	/** Clock for "today". Tests pass a fixed instant. */
	now?: () => Date;
}

export function createApp({ now = () => new Date() }: AppOptions = {}) {
	return createYoga({
		schema,
		context: (): GraphQLContext => ({
			now,
			forecastBudget: { left: MAX_FORECASTS_PER_REQUEST },
		}),
		logging: logger,
		graphiql: !isProduction,
		landingPage: false,
		maskedErrors: isProduction,
		plugins: isProduction ? [disableIntrospection] : [],
	});
}
