import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		env: { APP_MODE: "test" },
		setupFiles: ["./src/mocks/setup.ts"],
	},
});
