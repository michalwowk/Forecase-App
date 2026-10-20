import { readFileSync } from "node:fs";
import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "@/context/graphqlContext.ts";
import { placeForecastField } from "@/features/forecast/resolvers/forecastResolvers.ts";
import {
	nodeResolvers,
	placeFields,
	placeQueries,
} from "@/features/places/resolvers/placeResolvers.ts";
import type { Resolvers } from "@/generated/graphql.ts";
import { DateScalar } from "@/utils/dateScalar.ts";

const typeDefs = readFileSync(
	new URL("../schema.graphql", import.meta.url),
	"utf8",
);

// Each feature owns its resolvers; `Place` is shared by places (fields) and forecast.
const resolvers: Resolvers = {
	Date: DateScalar,
	Query: {
		health: () => ({ status: "ok" }),
		...placeQueries,
	},
	Node: nodeResolvers,
	Place: { ...placeFields, ...placeForecastField },
};

export const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });
