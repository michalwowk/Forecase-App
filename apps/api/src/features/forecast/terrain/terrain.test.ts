import { describe, expect, it } from "vitest";
import {
	bearing,
	type GridPoint,
	gridPoints,
	mountainPoint,
	seaBearing,
	townElevation,
} from "@/features/forecast/terrain/terrain.ts";
import { defaultConfig } from "@/features/scoring/config/defaultConfig.ts";

const terrain = defaultConfig.terrain; // 5×5, ±20 km, cap 2500, min 1000, rise 500
const town = { latitude: 47.26, longitude: 11.39 };

/** Grid around `town` with the given heights, row by row. */
const withHeights = (heights: number[]): GridPoint[] =>
	gridPoints(town, terrain).map((p, i) => ({
		...p,
		elevation: heights[i] ?? 0,
	}));
const flat = (height: number) =>
	withHeights(Array(terrain.gridSize ** 2).fill(height));

describe("gridPoints", () => {
	it("is a square around the town, corners ~20 km away", () => {
		const grid = gridPoints(town, terrain);
		expect(grid).toHaveLength(25);
		expect(grid[12]).toEqual(town);
		const corner = grid[0];
		expect(corner?.latitude).toBeCloseTo(town.latitude - 20 / 111.32, 6);
		expect(corner?.longitude).toBeLessThan(town.longitude - 20 / 111.32);
	});
});

describe("townElevation", () => {
	it("uses Geocoding's value", () => {
		expect(townElevation(town, 570, flat(600))).toBe(570);
	});

	it("falls back to the nearest grid point on missing or -9999", () => {
		const grid = flat(600).map((p, i) =>
			i === 12 ? { ...p, elevation: 584 } : p,
		);
		expect(townElevation(town, undefined, grid)).toBe(584);
		expect(townElevation(town, -9999, grid)).toBe(584);
	});
});

describe("mountainPoint", () => {
	it("takes the highest point, capped at 2500 m", () => {
		const grid = flat(600).map((p, i) =>
			i === 3 ? { ...p, elevation: 2894 } : p,
		);
		expect(mountainPoint(grid, 570, terrain)).toEqual({
			...grid[3],
			elevation: 2500,
		});
	});

	it("keeps a point below the cap as is", () => {
		const grid = flat(800).map((p, i) =>
			i === 20 ? { ...p, elevation: 1687 } : p,
		);
		expect(mountainPoint(grid, 819, terrain)?.elevation).toBe(1687);
	});

	it("not applicable below 1000 m", () => {
		expect(mountainPoint(flat(437), 220, terrain)).toBeNull();
	});

	it("not applicable when less than 500 m above the town", () => {
		expect(mountainPoint(flat(1400), 1000, terrain)).toBeNull();
	});
});

describe("seaBearing", () => {
	it("points from the town to the centre of the sea points", () => {
		// Left column (west) is sea.
		const grid = withHeights(
			Array.from({ length: 25 }, (_, i) => (i % 5 === 0 ? 0 : 50)),
		);
		expect(seaBearing(town, grid)).toBeCloseTo(270, 0);
	});

	it("null without sea points", () => {
		expect(seaBearing(town, flat(50))).toBeNull();
	});

	it("bearing: north 0, east 90", () => {
		expect(bearing(town, { ...town, latitude: 48 })).toBeCloseTo(0, 5);
		expect(bearing(town, { ...town, longitude: 12 })).toBeCloseTo(90, 0);
	});
});
