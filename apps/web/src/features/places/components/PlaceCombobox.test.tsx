import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlaceCombobox } from "@/features/places/components/PlaceCombobox.tsx";
import type { PlaceOption } from "@/features/places/hooks/usePlaceSearch.ts";
import { api } from "@/mocks/api.ts";
import { innsbruck, innsbruckAirport } from "@/mocks/fixtures/places.ts";
import { server } from "@/mocks/server.ts";
import { renderWithProviders } from "@/test/render.tsx";

function setup(selected: PlaceOption | null = null) {
	const onSelect = vi.fn();
	const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
	renderWithProviders(
		<PlaceCombobox selected={selected} onSelect={onSelect} />,
	);
	return { user, onSelect, input: screen.getByRole("combobox") };
}

function countSearches() {
	const queries: string[] = [];
	server.events.on("request:start", async ({ request }) => {
		const body = (await request.clone().json()) as {
			variables?: { query?: string };
		};
		if (body.variables?.query !== undefined) {
			queries.push(body.variables.query);
		}
	});
	return queries;
}

describe("PlaceCombobox", () => {
	beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
	afterEach(() => {
		vi.useRealTimers();
		server.events.removeAllListeners();
	});

	it("sends nothing below 2 trimmed characters", async () => {
		const queries = countSearches();
		const { user, input } = setup();
		await user.type(input, " i ");
		await act(() => vi.advanceTimersByTimeAsync(1000));
		expect(queries).toEqual([]);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("sends one trimmed request 300 ms after the last keystroke", async () => {
		const queries = countSearches();
		const { user, input } = setup();
		await user.type(input, " Inn");
		expect(screen.getByRole("status")).toHaveTextContent("Searching…");
		// shouldAdvanceTime lets the fake clock drift a few ms while typing.
		await act(() => vi.advanceTimersByTimeAsync(250));
		expect(queries).toEqual([]);

		await act(() => vi.advanceTimersByTimeAsync(100));
		const options = await screen.findAllByRole("option");
		expect(options.map((o) => o.textContent)).toEqual([
			"Innsbruck, Tyrol, Austria",
			"Innsbruck Airport, Tyrol, Austria",
		]);
		expect(queries).toEqual(["Inn"]);
	});

	it("picks a place with the keyboard", async () => {
		const { user, input, onSelect } = setup();
		await user.type(input, "Inn");
		await act(() => vi.advanceTimersByTimeAsync(300));
		await screen.findAllByRole("option");

		await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
		expect(onSelect).toHaveBeenCalledWith(innsbruckAirport);
		expect(screen.queryByRole("option")).not.toBeInTheDocument();
	});

	it("closes the list on Escape", async () => {
		const { user, input, onSelect } = setup();
		await user.type(input, "Inn");
		await act(() => vi.advanceTimersByTimeAsync(300));
		await screen.findAllByRole("option");

		await user.keyboard("{Escape}");
		expect(screen.queryByRole("option")).not.toBeInTheDocument();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("shows the picked place in the input", () => {
		setup(innsbruck);
		expect(screen.getByRole("combobox")).toHaveValue(
			"Innsbruck, Tyrol, Austria",
		);
	});

	it("says when nothing matches", async () => {
		const { user, input } = setup();
		await user.type(input, "Zzz");
		await act(() => vi.advanceTimersByTimeAsync(300));
		expect(
			await screen.findByText("No place called “Zzz”"),
		).toBeInTheDocument();
	});

	it("shows a search error and recovers on Retry", async () => {
		server.use(api.query("PlaceSearch", () => HttpResponse.error()));
		const { user, input } = setup();
		await user.type(input, "Inn");
		await act(() => vi.advanceTimersByTimeAsync(300));
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Search unavailable",
		);

		server.resetHandlers();
		await user.click(screen.getByRole("button", { name: "Retry" }));
		expect(await screen.findAllByRole("option")).toHaveLength(2);
	});
});
