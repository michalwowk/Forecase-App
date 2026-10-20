/** Per-request GraphQL context. `now` is injected so tests can fix the clock. */
export interface GraphQLContext {
	now: () => Date;
}
