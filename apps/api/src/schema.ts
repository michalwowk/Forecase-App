import { readFileSync } from "node:fs";
import { createSchema } from "graphql-yoga";
import type { GraphQLContext } from "@/context/graphqlContext.ts";
import { forecastQueries } from "@/features/forecast/resolvers/forecastResolvers.ts";
import {
	placeFields,
	placeQueries,
} from "@/features/places/resolvers/placeResolvers.ts";
import type { Resolvers } from "@/generated/graphql.ts";
import { DateScalar } from "@/utils/dateScalar.ts";

const typeDefs = readFileSync(
	new URL("../schema.graphql", import.meta.url),
	"utf8",
);

// Each feature owns its resolvers.
const resolvers: Resolvers = {
	Date: DateScalar,
	Query: {
		health: () => ({ status: "ok" }),
		...placeQueries,
		...forecastQueries,
	},
	Place: placeFields,
};

export const schema = createSchema<GraphQLContext>({ typeDefs, resolvers });
