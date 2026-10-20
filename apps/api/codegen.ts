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
			},
		},
	},
	silent: true,
};

export default config;
