import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers/index.ts";

/** Shared MSW server. Tests add per-case handlers with `server.use(...)`. */
export const server = setupServer(...handlers);
