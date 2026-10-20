import type { ActivityStrategy } from "@/features/scoring/activities/strategy.ts";
import type { ScoringConfig } from "@/features/scoring/config/schema.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

type WindConfig = ScoringConfig["surfWind"];
type Fields = HourlySeries["fields"];

const FULL_CIRCLE = 360;
const HALF_CIRCLE = 180;

/** Angle 0–180° between the direction the wind blows from and the sea bearing. */
function angleOff(windFrom: number, seaBearing: number): number {
	const diff =
		(((windFrom - seaBearing) % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
	return diff > HALF_CIRCLE ? FULL_CIRCLE - diff : diff;
}

/** Speed × onshore / cross / offshore factor (D-020). */
export function effectiveWind(
	speed: number,
	windFrom: number,
	seaBearing: number | null,
	config: WindConfig,
): number {
	const { factors } = config;
	if (seaBearing === null) return speed * factors.noBearing;
	const angle = angleOff(windFrom, seaBearing);
	if (angle <= config.onshoreMaxAngle) return speed * factors.onshore;
	if (angle >= config.offshoreMinAngle) return speed * factors.offshore;
	return speed * factors.cross;
}

/** Inland marine responses are HTTP 200 with every value null (no sea). */
function hasAnyValue(series: HourlySeries): boolean {
	return Object.values(series.fields).some((values) =>
		values.some((v) => v != null),
	);
}

/** Marine fields re-indexed onto the town's hours; hours missing in marine → null. */
function alignToTown(town: HourlySeries, marine: HourlySeries): Fields {
	const marineIndex = new Map(marine.time.map((time, i) => [time, i]));
	const aligned: Record<string, (number | null)[]> = {};
	for (const [name, values] of Object.entries(marine.fields)) {
		aligned[name] = town.time.map((time) => {
			const i = marineIndex.get(time);
			return i === undefined ? null : (values[i] ?? null);
		});
	}
	return aligned;
}

/** Hourly effective wind from the town's wind speed and direction. */
function effectiveWindHours(
	town: HourlySeries,
	seaBearing: number | null,
	config: WindConfig,
): (number | null)[] {
	const speeds = town.fields[config.speedField] ?? [];
	const directions = town.fields[config.directionField] ?? [];
	return town.time.map((_, i) => {
		const speed = speeds[i];
		const from = directions[i];
		if (speed == null || from == null) return null;
		return effectiveWind(speed, from, seaBearing, config);
	});
}

/**
 * Town series (weather, wind, Unsafe checks) + marine waves + effective wind.
 * No marine series or all-null → not applicable (D-009).
 */
export const surfing: ActivityStrategy = {
	series: (input, config) => {
		const { marine, town, seaBearing } = input;
		if (!marine || !hasAnyValue(marine)) return null;

		const wind = config.surfWind;
		return {
			time: town.time,
			fields: {
				...town.fields,
				...alignToTown(town, marine),
				[wind.field]: effectiveWindHours(town, seaBearing, wind),
			},
		};
	},
};
