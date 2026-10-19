import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "../api/schema.graphql",
	documents: ["src/**/*.{ts,tsx}", "!src/generated/**"],
	generates: {
		"src/generated/": {
			preset: "client",
			config: {
				useTypeImports: true,
				enumsAsTypes: true,
				documentMode: "string",
			},
		},
	},
	silent: true,
};

export default config;
