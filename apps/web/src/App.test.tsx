import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App.tsx";
import { innsbruck, nazare } from "@/mocks/fixtures/places.ts";
import { renderWithProviders } from "@/test/render.tsx";

describe("App", () => {
	beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
	afterEach(() => {
		vi.useRealTimers();
		window.history.replaceState(null, "", "/");
	});

	it("starts empty, without a grid", () => {
		renderWithProviders(<App />);
		expect(screen.getByText(/Pick a place/)).toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Open-Meteo.com" })).toBeVisible();
		expect(screen.getByRole("link", { name: "GeoNames" })).toBeVisible();
	});

	it("pushes the picked place to the URL and shows its week", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderWithProviders(<App />);
		await user.type(screen.getByRole("combobox"), "Naz");
		await act(() => vi.advanceTimersByTimeAsync(300));
		await user.click(
			await screen.findByRole("option", { name: "Nazaré, Leiria, Portugal" }),
		);

		expect(window.location.search).toBe(`?place=${nazare.id}`);
		expect(await screen.findByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toHaveValue(
			"Nazaré, Leiria, Portugal",
		);
	});

	it("restores the place from the URL and follows back/forward", async () => {
		window.history.replaceState(null, "", `/?place=${innsbruck.id}`);
		renderWithProviders(<App />);
		await waitFor(() =>
			expect(screen.getByRole("combobox")).toHaveValue(
				"Innsbruck, Tyrol, Austria",
			),
		);
		expect(screen.getByRole("table")).toBeInTheDocument();

		act(() => window.history.pushState(null, "", `/?place=${nazare.id}`));
		act(() => window.dispatchEvent(new PopStateEvent("popstate")));
		await waitFor(() =>
			expect(screen.getByRole("combobox")).toHaveValue(
				"Nazaré, Leiria, Portugal",
			),
		);

		act(() => window.history.back());
		await waitFor(() =>
			expect(screen.getByRole("combobox")).toHaveValue(
				"Innsbruck, Tyrol, Austria",
			),
		);
	});

	it("says Place not found and drops an unknown id from the URL", async () => {
		window.history.replaceState(null, "", "/?place=999");
		const length = window.history.length;
		renderWithProviders(<App />);
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Place not found",
		);
		expect(window.location.search).toBe("");
		expect(window.history.length).toBe(length);
	});

	it("clears the day detail when the place changes", async () => {
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		window.history.replaceState(null, "", `/?place=${innsbruck.id}`);
		renderWithProviders(<App />);
		const [cell] = await screen.findAllByRole("button", { name: /^Great/ });
		await user.click(cell as HTMLElement);
		expect(screen.getByRole("region", { name: "Day detail" })).toBeVisible();

		act(() => window.history.pushState(null, "", `/?place=${nazare.id}`));
		act(() => window.dispatchEvent(new PopStateEvent("popstate")));
		await screen.findByRole("table");
		expect(screen.queryByRole("region")).not.toBeInTheDocument();
	});
});
