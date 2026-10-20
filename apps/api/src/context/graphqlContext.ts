/** Per-request GraphQL context. `now` is injected so tests can fix the clock. */
export interface GraphQLContext {
	now: () => Date;
	/** Forecasts this request may still compute (each one costs 4 Open-Meteo calls). */
	forecastBudget: { left: number };
}

/** Aliased `forecast` fields would otherwise fan out to hundreds of calls. */
export const MAX_FORECASTS_PER_REQUEST = 1;
