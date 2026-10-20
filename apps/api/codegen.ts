import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "schema.graphql",
	generates: {
		"src/generated/graphql.ts": {
			plugins: ["typescript", "typescript-resolvers"],
			config: {
				useTypeImports: true,
				// Every Query field must have a resolver; object fields keep default resolvers.
				avoidOptionals: { query: true },
				// String unions, not TS enums (`erasableSyntaxOnly`).
				enumsAsTypes: true,
				scalars: { Date: "string" },
				contextType: "@/context/graphqlContext.ts#GraphQLContext",
				// Resolvers receive our internal objects; field resolvers map them.
				mappers: {
					Place: "@/features/openMeteo/geocoding/geocoding.ts#GeocodingPlace",
				},
			},
		},
	},
	silent: true,
};

export default config;
