import { z } from "zod";

// The only place that reads process.env. Everything else imports `env`.
const schema = z.object({
	APP_MODE: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().min(1).max(65535).default(4000),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
	const result = schema.safeParse(source);
	if (!result.success) {
		const lines = result.error.issues.map(
			(issue) => `  - ${issue.path.join(".")}: ${issue.message}`,
		);
		throw new Error(`Invalid env:\n${lines.join("\n")}`);
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
