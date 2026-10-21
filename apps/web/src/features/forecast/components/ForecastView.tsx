import { useState } from "react";
import { DayDetail } from "@/features/forecast/components/DayDetail.tsx";
import { GridSkeleton } from "@/features/forecast/components/GridSkeleton.tsx";
import {
	type CellRef,
	WeekGrid,
} from "@/features/forecast/components/WeekGrid.tsx";
import type { useForecast } from "@/features/forecast/hooks/useForecast.ts";

/** Loading, error and grid states of one place. Unknown place (null) is handled by the page. */
export function ForecastView({
	forecast,
}: {
	forecast: ReturnType<typeof useForecast>;
}) {
	const [selected, setSelected] = useState<CellRef | null>(null);

	if (forecast.isPending) {
		return <GridSkeleton />;
	}
	if (forecast.isError) {
		return (
			<div role="alert" className="flex items-center gap-3 text-slate-700">
				<span>Forecast unavailable</span>
				<button
					type="button"
					onClick={() => forecast.refetch()}
					disabled={forecast.isFetching}
					className="rounded border border-slate-300 px-2 py-0.5 text-sm hover:bg-slate-50"
				>
					Retry
				</button>
			</div>
		);
	}
	if (!forecast.data) {
		return null;
	}

	const { activities } = forecast.data;
	const row = activities.find((a) => a.activity === selected?.activity);
	const day = row?.days.find((d) => d.date === selected?.date);

	return (
		<>
			<WeekGrid
				activities={activities}
				selected={selected}
				onSelect={(cell) =>
					setSelected(
						cell.activity === selected?.activity && cell.date === selected.date
							? null
							: cell,
					)
				}
			/>
			{row && day && <DayDetail row={row} day={day} />}
		</>
	);
}
