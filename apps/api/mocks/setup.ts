import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server.ts";

// Any outbound request without a handler fails the test.
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
