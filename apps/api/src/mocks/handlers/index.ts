import type { AnyHandler } from "msw";
import { openMeteoHandlers } from "@/mocks/handlers/open-meteo.ts";

// One file per outbound domain.
export const handlers: AnyHandler[] = [...openMeteoHandlers];
