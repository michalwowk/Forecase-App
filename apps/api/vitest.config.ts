import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		// Short timeout so timeout tests stay fast.
		env: { APP_MODE: "test", OPEN_METEO_TIMEOUT_MS: "200" },
		setupFiles: ["./src/mocks/setup.ts"],
	},
});
