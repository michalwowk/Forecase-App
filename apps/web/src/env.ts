import { z } from "zod";

// The only place that reads import.meta.env. Only VITE_* vars reach the browser.
const schema = z.object({
	VITE_API_URL: z.string().min(1).default("/graphql"),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, unknown>): Env {
	const result = schema.safeParse(source);
	if (!result.success) {
		const lines = result.error.issues.map(
			(issue) => `  - ${issue.path.join(".")}: ${issue.message}`,
		);
		throw new Error(`Invalid env:\n${lines.join("\n")}`);
	}
	return result.data;
}

export const env = parseEnv(import.meta.env);
