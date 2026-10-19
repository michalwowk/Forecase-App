import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	server: {
		// Dev only: same-origin /graphql, no CORS.
		proxy: { "/graphql": "http://localhost:4000" },
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./mocks/setup.ts"],
	},
});
