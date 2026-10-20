/** Per-request GraphQL context. `now` is injected so tests can fix the clock. */
export interface GraphQLContext {
	now: () => Date;
	/** Forecasts this request may still compute (each one costs 3 Open-Meteo calls). */
	forecastBudget: { left: number };
}

/** One forecast per request: `placeSearch { forecast }` would otherwise fan out to 300 calls. */
export const MAX_FORECASTS_PER_REQUEST = 1;
