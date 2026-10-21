import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@/mocks/server.ts";

// jsdom has no ResizeObserver; Headless UI uses it to track the combobox input.
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
};

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
	cleanup();
	server.resetHandlers();
});
afterAll(() => server.close());
