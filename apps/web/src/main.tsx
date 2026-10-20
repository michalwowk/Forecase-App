import { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App.tsx";
import { AppProviders } from "@/context/AppProviders.tsx";
import "@/index.css";

const root = document.getElementById("root");
if (!root) {
	throw new Error("Missing #root element");
}

createRoot(root).render(
	<StrictMode>
		<AppProviders client={new QueryClient()}>
			<App />
		</AppProviders>
	</StrictMode>,
);
