import { z } from "zod";

// The only place that reads process.env. Everything else imports `env`.
const schema = z.object({
	APP_MODE: z.enum(["development", "test", "production"]).default("production"),
	PORT: z.coerce.number().int().min(1).max(65535).default(4000),
	/** Per Open-Meteo call. Slower → treated as the service being down. */
	OPEN_METEO_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
	const result = schema.safeParse(source);
	if (!result.success) {
		throw new Error(`Invalid env:\n${z.prettifyError(result.error)}`);
	}
	return result.data;
}

function loadEnv(): Env {
	try {
		return parseEnv(process.env);
	} catch (error) {
		console.error((error as Error).message);
		process.exit(1);
	}
}

export const env = loadEnv();
