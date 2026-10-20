import type { Comparison } from "@/features/scoring/config/schema.ts";

const comparisons: Record<Comparison, (a: number, b: number) => boolean> = {
	gt: (a, b) => a > b,
	gte: (a, b) => a >= b,
	lt: (a, b) => a < b,
	lte: (a, b) => a <= b,
};

/** `a op b`, e.g. compare("gte", 12, 10) → true. */
export function compare(op: Comparison, a: number, b: number): boolean {
	return comparisons[op](a, b);
}

/** Most extreme value in the direction of `op` (highest for gt/gte, lowest for lt/lte). */
export function mostExtreme(op: Comparison, values: number[]): number {
	return op === "gt" || op === "gte"
		? Math.max(...values)
		: Math.min(...values);
}
