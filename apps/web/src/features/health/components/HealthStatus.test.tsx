import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { api } from "#mocks/api.ts";
import { server } from "#mocks/server.ts";
import { HealthStatus } from "#src/features/health/components/HealthStatus.tsx";

function renderHealth() {
	const client = new QueryClient();
	return render(
		<QueryClientProvider client={client}>
			<HealthStatus />
		</QueryClientProvider>,
	);
}

describe("HealthStatus", () => {
	it("shows loading, then the API status", async () => {
		renderHealth();
		expect(screen.getByText("Checking API…")).toBeInTheDocument();
		expect(await screen.findByText("API status: ok")).toBeInTheDocument();
	});

	it("shows 'API unavailable' and recovers on Retry", async () => {
		server.use(api.query("Health", () => HttpResponse.error()));
		renderHealth();
		expect(await screen.findByText("API unavailable")).toBeInTheDocument();

		server.resetHandlers();
		await userEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(await screen.findByText("API status: ok")).toBeInTheDocument();
	});
});
