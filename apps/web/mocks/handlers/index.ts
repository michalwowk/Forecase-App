import { healthHandlers } from "./health.ts";

// One file per domain.
export const handlers = [...healthHandlers];
