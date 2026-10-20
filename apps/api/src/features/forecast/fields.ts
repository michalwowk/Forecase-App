// Open-Meteo hourly fields we fetch (docs/research/data-selection.md).
// fields.test.ts checks that every field the scoring config reads is fetched.

/** Forecast API, town and mountain point. */
export const FORECAST_FIELDS = [
	"temperature_2m",
	"apparent_temperature",
	"precipitation",
	"precipitation_probability",
	"weather_code",
	"wind_speed_10m",
	"wind_direction_10m",
	"wind_gusts_10m",
	"sunshine_duration",
	"snowfall",
	"snow_depth",
] as const;

/** Marine API, town point. */
export const MARINE_FIELDS = [
	"swell_wave_height",
	"swell_wave_period",
	"wind_wave_height",
] as const;
