import { z } from "zod";
import { buildUrl, getJson } from "@/features/openMeteo/client/getJson.ts";

const URL_ELEVATION = "https://api.open-meteo.com/v1/elevation";

export interface LatLon {
	latitude: number;
	longitude: number;
}

/** Ground height in metres per point, same order, in one call. Sea = 0. */
export function fetchElevations(points: readonly LatLon[]): Promise<number[]> {
	const url = buildUrl(URL_ELEVATION, {
		latitude: points.map((p) => p.latitude).join(","),
		longitude: points.map((p) => p.longitude).join(","),
	});
	const response = z
		.object({ elevation: z.array(z.number()) })
		.refine(
			(r) => r.elevation.length === points.length,
			"one elevation per point",
		)
		.transform((r) => r.elevation);
	return getJson("elevation", url, response);
}
