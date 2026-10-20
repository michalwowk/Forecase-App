import { QueryClient } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppProviders } from "@/context/AppProviders.tsx";

// render() inside all app providers. Fresh QueryClient per call: no cache shared between tests.
export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(ui, {
		wrapper: ({ children }) => (
			<AppProviders client={client}>{children}</AppProviders>
		),
		...options,
	});
}
