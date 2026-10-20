import { GraphQLScalarType, Kind } from "graphql";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function parse(value: unknown): string {
	if (typeof value !== "string" || !DATE.test(value)) {
		throw new TypeError(`Date must be YYYY-MM-DD, got ${String(value)}`);
	}
	return value;
}

/** Local calendar date "YYYY-MM-DD", no time, no timezone. */
export const DateScalar = new GraphQLScalarType<string, string>({
	name: "Date",
	serialize: parse,
	parseValue: parse,
	parseLiteral: (ast) => parse(ast.kind === Kind.STRING ? ast.value : null),
});
