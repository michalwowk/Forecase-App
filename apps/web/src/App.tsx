import { useEffect, useState } from "react";
import { ForecastView } from "@/features/forecast/components/ForecastView.tsx";
import { useForecast } from "@/features/forecast/hooks/useForecast.ts";
import { PlaceCombobox } from "@/features/places/components/PlaceCombobox.tsx";
import type { PlaceOption } from "@/features/places/hooks/usePlaceSearch.ts";
import { clearPlace, pushPlace, usePlaceParam } from "@/hooks/usePlaceParam.ts";

export function App() {
	const placeId = usePlaceParam();
	const forecast = useForecast(placeId);
	// Shown in the input until the forecast brings the place (reload: only the URL knows the id).
	const [picked, setPicked] = useState<PlaceOption | null>(null);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (placeId !== null && forecast.data === null) {
			setNotFound(true);
			clearPlace();
		}
	}, [placeId, forecast.data]);

	const selected =
		forecast.data?.place ?? (picked?.id === placeId ? picked : null);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<main className="mx-auto max-w-5xl px-8 py-8">
				<h1 className="mb-6 text-2xl font-bold">Forecase</h1>
				<PlaceCombobox
					selected={selected}
					onSelect={(place) => {
						setPicked(place);
						setNotFound(false);
						pushPlace(place.id);
					}}
				/>
				<div className="mt-8">
					{placeId !== null ? (
						<ForecastView key={placeId} forecast={forecast} />
					) : notFound ? (
						<p role="alert">Place not found. Search again.</p>
					) : (
						<p className="text-slate-600">
							Pick a place to see which of the next 7 days is best for skiing,
							surfing, outdoor and indoor sightseeing.
						</p>
					)}
				</div>
			</main>
			<footer className="mx-auto max-w-5xl px-8 pb-8 text-sm text-slate-500">
				Weather data by{" "}
				<a className="underline" href="https://open-meteo.com/">
					Open-Meteo.com
				</a>{" "}
				· Places by{" "}
				<a className="underline" href="https://www.geonames.org/">
					GeoNames
				</a>
			</footer>
		</div>
	);
}
