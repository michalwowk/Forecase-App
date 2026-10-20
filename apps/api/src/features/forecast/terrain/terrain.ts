import type { LatLon } from "@/features/openMeteo/elevation/elevation.ts";
import type { ScoringConfig } from "@/features/scoring/config/schema.ts";

// Facts about the land around a town, from one Elevation grid call:
// the mountain point for skiing (D-012, D-024) and the sea bearing for surfing (D-020).

type TerrainConfig = ScoringConfig["terrain"];

const KM_PER_DEGREE_LAT = 111.32;
const SEA_LEVEL = 0;
/** Geocoding's "no elevation" sentinel. */
const NO_ELEVATION = -9999;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
/** Longitude back into −180…180 (grids near the antimeridian). */
const wrapLongitude = (lon: number) => {
	if (lon > 180) return lon - 360;
	if (lon < -180) return lon + 360;
	return lon;
};

export interface GridPoint extends LatLon {
	elevation: number;
}

/** gridSize × gridSize points, ±radiusKm around the town, row by row. */
export function gridPoints(town: LatLon, config: TerrainConfig): LatLon[] {
	const dLat = config.radiusKm / KM_PER_DEGREE_LAT;
	const dLon =
		config.radiusKm / (KM_PER_DEGREE_LAT * Math.cos(toRad(town.latitude)));
	const step = (i: number) => -1 + (2 * i) / (config.gridSize - 1);
	const cells = Array.from({ length: config.gridSize }, (_, i) => step(i));
	return cells.flatMap((row) =>
		cells.map((col) => ({
			latitude: town.latitude + row * dLat,
			longitude: wrapLongitude(town.longitude + col * dLon),
		})),
	);
}

/** Town height: Geocoding's value, else the nearest grid point, else null (unknown). */
export function townElevation(
	town: LatLon,
	geocoded: number | undefined,
	grid: readonly GridPoint[] | null,
): number | null {
	if (geocoded !== undefined && geocoded !== NO_ELEVATION) return geocoded;
	if (!grid?.length) return null;
	const distance = (p: LatLon) =>
		(p.latitude - town.latitude) ** 2 + (p.longitude - town.longitude) ** 2;
	const nearest = grid.reduce((a, b) => (distance(b) < distance(a) ? b : a));
	return nearest.elevation;
}

/** Highest grid point, capped; null when there are no real mountains nearby. */
export function mountainPoint(
	grid: readonly GridPoint[],
	town: number,
	config: TerrainConfig,
): GridPoint | null {
	const highest = grid.reduce((a, b) => (b.elevation > a.elevation ? b : a));
	const tooLow =
		highest.elevation < config.minElevation ||
		highest.elevation < town + config.minRise;
	if (tooLow) return null;
	return {
		...highest,
		elevation: Math.min(highest.elevation, config.maxElevation),
	};
}

/** Compass bearing 0–360° from `a` to `b`. */
export function bearing(a: LatLon, b: LatLon): number {
	const lat1 = toRad(a.latitude);
	const lat2 = toRad(b.latitude);
	const dLon = toRad(b.longitude - a.longitude);
	const y = Math.sin(dLon) * Math.cos(lat2);
	const x =
		Math.cos(lat1) * Math.sin(lat2) -
		Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
	return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Town → centre of the sea points (0 m) in the grid; null when there are none. */
export function seaBearing(
	town: LatLon,
	grid: readonly GridPoint[],
): number | null {
	const sea = grid.filter((p) => p.elevation === SEA_LEVEL);
	if (sea.length === 0) return null;
	const mean = (pick: (p: LatLon) => number) =>
		sea.reduce((sum, p) => sum + pick(p), 0) / sea.length;
	return bearing(town, {
		latitude: mean((p) => p.latitude),
		longitude: mean((p) => p.longitude),
	});
}
