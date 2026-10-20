import { FORECAST_FIELDS, MARINE_FIELDS } from "@/features/forecast/fields.ts";
import {
	type GridPoint,
	gridPoints,
	mountainPoint,
	seaBearing,
	townElevation,
} from "@/features/forecast/terrain/terrain.ts";
import {
	fetchRange,
	localToday,
	toLocalSeries,
} from "@/features/forecast/time/time.ts";
import { UpstreamError } from "@/features/openMeteo/client/upstreamError.ts";
import { fetchElevations } from "@/features/openMeteo/elevation/elevation.ts";
import { fetchForecast } from "@/features/openMeteo/forecast/forecast.ts";
import type { GeocodingPlace } from "@/features/openMeteo/geocoding/geocoding.ts";
import { fetchMarine } from "@/features/openMeteo/marine/marine.ts";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";
import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import { scoreWeek } from "@/features/scoring/scoreWeek.ts";
import type { WeekResult } from "@/features/scoring/types.ts";
import { logger } from "@/logger.ts";

export interface PlaceForecast {
	week: WeekResult;
	/** false → that row failed upstream ("Data temporarily unavailable"). */
	available: { skiing: boolean; surfing: boolean };
	/** Height the skiing forecast is for; null when skiing is not applicable or unavailable. */
	dataElevation: number | null;
}

/** Partial failure: an UpstreamError becomes null (row unavailable); anything else is a bug. */
async function orNull<T>(call: Promise<T>): Promise<T | null> {
	try {
		return await call;
	} catch (error) {
		if (!(error instanceof UpstreamError)) throw error;
		logger.warn({ err: error }, "partial upstream failure");
		return null;
	}
}

/**
 * Live data → scored week for one place. 3 rounds (vision.md):
 * Elevation grid + Marine in parallel → Forecast for town + mountain point → scoreWeek.
 * Elevation or Marine down → that row unavailable. Forecast down → throws UpstreamError.
 */
export async function placeForecast(
	place: GeocodingPlace,
	now: Date,
	config: ScoringConfig = defaultConfig,
): Promise<PlaceForecast> {
	const { timezone } = place;
	const today = localToday(now, timezone);
	const range = fetchRange(today, timezone, config);
	const grid = gridPoints(place, config.terrain);

	const [heights, marine] = await Promise.all([
		orNull(fetchElevations(grid)),
		orNull(fetchMarine(place, MARINE_FIELDS, range)),
	]);

	// fetchElevations guarantees one height per point.
	const terrain: GridPoint[] | null =
		heights &&
		grid.flatMap((p, i) => {
			const elevation = heights[i];
			return elevation === undefined ? [] : [{ ...p, elevation }];
		});
	const town = townElevation(place, place.elevation, terrain);
	const mountain =
		terrain && town !== null
			? mountainPoint(terrain, town, config.terrain)
			: null;

	const points = [
		{ ...place, elevation: town },
		...(mountain ? [mountain] : []),
	];
	const series = await fetchForecast(points, FORECAST_FIELDS, range);
	const [townSeries, mountainSeries] = series;
	if (!townSeries || series.length !== points.length) {
		throw new UpstreamError("forecast", "shape", {
			reason: `expected ${points.length} series, got ${series.length}`,
		});
	}

	const week = scoreWeek(
		{
			today,
			town: toLocalSeries(townSeries, timezone),
			mountain: mountainSeries ? toLocalSeries(mountainSeries, timezone) : null,
			marine: marine ? toLocalSeries(marine, timezone) : null,
			seaBearing: terrain ? seaBearing(place, terrain) : null,
		},
		config,
	);

	return {
		week,
		available: { skiing: terrain !== null, surfing: marine !== null },
		dataElevation: mountain ? Math.round(mountain.elevation) : null,
	};
}
