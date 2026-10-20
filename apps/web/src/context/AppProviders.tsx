import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Every app-wide provider. Used by main.tsx and by tests, so both see the same tree.
export function AppProviders({
	client,
	children,
}: {
	client: QueryClient;
	children: ReactNode;
}) {
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
