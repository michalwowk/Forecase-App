import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ForecastView } from "@/features/forecast/components/ForecastView.tsx";
import { useForecast } from "@/features/forecast/hooks/useForecast.ts";
import { api } from "@/mocks/api.ts";
import {
	buildForecast,
	poorRow,
	unavailableRow,
} from "@/mocks/fixtures/forecast.ts";
import { innsbruck } from "@/mocks/fixtures/places.ts";
import { server } from "@/mocks/server.ts";
import { renderWithProviders } from "@/test/render.tsx";

function View({ placeId }: { placeId: string }) {
	return <ForecastView forecast={useForecast(placeId)} />;
}

function answer(forecast: ReturnType<typeof buildForecast>) {
	server.use(
		api.query("Forecast", () => HttpResponse.json({ data: { forecast } })),
	);
}

async function rowCells(name: string) {
	const header = await screen.findByRole("rowheader", {
		name: new RegExp(`^${name}`),
	});
	const row = header.closest("tr");
	if (!row) throw new Error(`No row ${name}`);
	return within(row).getAllByRole("cell");
}

describe("ForecastView", () => {
	it("shows a grid skeleton while loading", () => {
		renderWithProviders(<View placeId={innsbruck.id} />);
		expect(screen.getByRole("status")).toHaveTextContent("Loading forecast…");
	});

	it("shows day columns and a label word in every scored cell", async () => {
		renderWithProviders(<View placeId={innsbruck.id} />);
		const headers = await screen.findAllByRole("columnheader");
		expect(headers.map((h) => h.textContent)).toEqual([
			"Thu 22",
			"Fri 23",
			"Sat 24",
			"Sun 25",
			"Mon 26",
			"Tue 27",
			"Wed 28",
		]);
		const indoor = await rowCells("Indoor");
		expect(indoor.map((c) => c.textContent)).toEqual([
			"Fair",
			"Fair",
			"Great ★, best day",
			"Good",
			"Unsafe",
			"Fair",
			"Fair",
		]);
	});

	it("marks Unsafe and No data with their own words", async () => {
		renderWithProviders(<View placeId={innsbruck.id} />);
		const outdoor = await rowCells("Outdoor");
		expect(outdoor[3]).toHaveTextContent("No data");
		expect(outdoor[4]).toHaveTextContent("Unsafe");
	});

	it("shows the skiing data height", async () => {
		renderWithProviders(<View placeId={innsbruck.id} />);
		expect(
			await screen.findByRole("rowheader", { name: "Skiing ~2200 m nearby" }),
		).toBeInTheDocument();
	});

	it("collapses a Not applicable week into one cell with the reason", async () => {
		renderWithProviders(<View placeId={innsbruck.id} />);
		const surfing = await rowCells("Surfing");
		expect(surfing).toHaveLength(1);
		expect(surfing[0]).toHaveTextContent(
			"Not applicable — No sea near this place",
		);
	});

	it("says when a row is temporarily unavailable", async () => {
		answer(buildForecast({ SKIING: unavailableRow("SKIING") }));
		renderWithProviders(<View placeId={innsbruck.id} />);
		const skiing = await rowCells("Skiing");
		expect(skiing).toHaveLength(1);
		expect(skiing[0]).toHaveTextContent("Data temporarily unavailable");
		expect(await rowCells("Outdoor")).toHaveLength(7);
	});

	it("marks no best day when the row has none", async () => {
		answer(buildForecast({ OUTDOOR: poorRow("OUTDOOR") }));
		renderWithProviders(<View placeId={innsbruck.id} />);
		const outdoor = await rowCells("Outdoor");
		expect(outdoor.some((c) => c.textContent?.includes("best day"))).toBe(
			false,
		);
	});

	it("opens the day detail and closes it on a second click", async () => {
		const user = userEvent.setup();
		renderWithProviders(<View placeId={innsbruck.id} />);
		const cell = within((await rowCells("Skiing"))[2] as HTMLElement).getByRole(
			"button",
		);

		await user.click(cell);
		const detail = screen.getByRole("region", { name: "Day detail" });
		expect(within(detail).getByRole("heading")).toHaveTextContent(
			"Sat 24 Oct · Skiing · Great (86)",
		);
		expect(detail).toHaveTextContent("Fresh snow 14 cm");
		expect(detail).toHaveTextContent("Snow depth80 cm");
		expect(detail).toHaveTextContent(
			"Data for ~2200 m in the mountains nearby",
		);
		expect(cell).toHaveAttribute("aria-expanded", "true");

		await user.click(cell);
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
	});

	it("shows the state and reason, without a score, for an unscored day", async () => {
		const user = userEvent.setup();
		renderWithProviders(<View placeId={innsbruck.id} />);
		const outdoor = await rowCells("Outdoor");
		await user.click(within(outdoor[4] as HTMLElement).getByRole("button"));

		const detail = screen.getByRole("region", { name: "Day detail" });
		expect(within(detail).getByRole("heading")).toHaveTextContent(
			"Mon 26 Oct · Outdoor · Unsafe",
		);
		expect(detail).toHaveTextContent(
			"Violent gusts up to 110 km/h — stay home",
		);
	});

	it("shows an error and recovers on Retry", async () => {
		server.use(api.query("Forecast", () => HttpResponse.error()));
		const user = userEvent.setup();
		renderWithProviders(<View placeId={innsbruck.id} />);
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Forecast unavailable",
		);

		server.resetHandlers();
		await user.click(screen.getByRole("button", { name: "Retry" }));
		expect(await rowCells("Skiing")).toHaveLength(7);
	});
});
