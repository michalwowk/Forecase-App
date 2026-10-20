import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "node_modules/@forecase/api/schema.graphql",
	documents: ["src/**/*.{ts,tsx}", "!src/generated/**"],
	generates: {
		"src/generated/": {
			preset: "client",
			config: {
				useTypeImports: true,
				documentMode: "string",
			},
		},
	},
	silent: true,
};

export default config;
