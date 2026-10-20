import { z } from "zod";

/** Every Open-Meteo call with time data uses UTC (see ../README.md). */
export const UTC = "GMT";

/** Hourly block in UTC. `time` is "2026-10-21T09:00" (UTC, no offset); values align by index. */
export interface UtcHourlySeries {
	time: string[];
	fields: Record<string, (number | null)[]>;
}

/** UTC hour range, both ends included (Open-Meteo `start_hour` / `end_hour`). */
export interface UtcHourRange {
	start: string;
	end: string;
}

const values = z.array(z.number().nullable());

/** One location's response: `hourly.time` + every requested field, same length. */
export function hourlyResponse(fields: readonly string[]) {
	return z
		.object({
			hourly: z
				.object({ time: z.array(z.string()) })
				.extend(Object.fromEntries(fields.map((f) => [f, values]))),
		})
		.transform(({ hourly }): UtcHourlySeries => {
			const { time, ...rest } = hourly as { time: string[] } & Record<
				string,
				(number | null)[]
			>;
			return { time, fields: rest };
		})
		.refine(
			(s) => Object.values(s.fields).every((v) => v.length === s.time.length),
			"every hourly field must have one value per hour",
		);
}

/** Multi-location responses are a JSON array; a single location is an object. */
export function oneOrMany<T extends z.ZodType>(item: T) {
	return z.union([z.array(item), item.transform((one) => [one])]);
}
