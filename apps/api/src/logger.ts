import { pino } from "pino";
import { env } from "./env.ts";

const levels = {
	development: "debug",
	test: "silent",
	production: "info",
} as const;

export const logger = pino({
	level: levels[env.APP_MODE],
	transport:
		env.APP_MODE === "development" ? { target: "pino-pretty" } : undefined,
});
