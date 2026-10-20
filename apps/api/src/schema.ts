import { readFileSync } from "node:fs";
import { createSchema } from "graphql-yoga";
import type { Resolvers } from "#src/generated/graphql.ts";

const typeDefs = readFileSync(
	new URL("../schema.graphql", import.meta.url),
	"utf8",
);

const resolvers: Resolvers = {
	Query: {
		health: () => ({ status: "ok" }),
	},
};

export const schema = createSchema({ typeDefs, resolvers });
