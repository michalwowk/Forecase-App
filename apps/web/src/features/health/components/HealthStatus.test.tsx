import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { HealthStatus } from "@/features/health/components/HealthStatus.tsx";
import { api } from "@/mocks/api.ts";
import { server } from "@/mocks/server.ts";
import { renderWithProviders } from "@/test/render.tsx";

describe("HealthStatus", () => {
	it("shows loading, then the API status", async () => {
		renderWithProviders(<HealthStatus />);
		expect(screen.getByText("Checking API…")).toBeInTheDocument();
		expect(await screen.findByText("API status: ok")).toBeInTheDocument();
	});

	it("shows 'API unavailable' and recovers on Retry", async () => {
		server.use(api.query("Health", () => HttpResponse.error()));
		renderWithProviders(<HealthStatus />);
		expect(await screen.findByText("API unavailable")).toBeInTheDocument();

		server.resetHandlers();
		await userEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(await screen.findByText("API status: ok")).toBeInTheDocument();
	});
});
