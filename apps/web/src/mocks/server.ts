import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers/index.ts";

export const server = setupServer(...handlers);
