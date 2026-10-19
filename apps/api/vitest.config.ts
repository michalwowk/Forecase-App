import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		env: { APP_MODE: "test" },
		setupFiles: ["./mocks/setup.ts"],
	},
});
