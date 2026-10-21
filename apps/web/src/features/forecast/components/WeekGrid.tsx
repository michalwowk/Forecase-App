import type {
	ActivityRow,
	Day,
} from "@/features/forecast/hooks/useForecast.ts";
import { ACTIVITY_NAMES, dayLook } from "@/features/forecast/utils/labels.ts";
import { formatDayShort } from "@/utils/dates.ts";

export type CellRef = { activity: ActivityRow["activity"]; date: string };

const cell = "h-12 w-24 rounded-md px-2 text-sm";

export function WeekGrid({
	activities,
	selected,
	onSelect,
}: {
	activities: ActivityRow[];
	selected: CellRef | null;
	onSelect: (cell: CellRef) => void;
}) {
	// Unavailable rows have no days; any other row gives the 7 dates.
	const dates = activities.find((a) => a.days.length > 0)?.days ?? [];

	return (
		<table className="border-separate border-spacing-1">
			<thead>
				<tr>
					<td />
					{dates.map((day) => (
						<th
							key={day.date}
							scope="col"
							className="text-sm font-medium text-slate-600"
						>
							{formatDayShort(day.date)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{activities.map((row) => (
					<tr key={row.activity}>
						<th scope="row" className="pr-3 text-left align-middle">
							<span className="block">{ACTIVITY_NAMES[row.activity]}</span>{" "}
							{row.dataElevation !== null &&
								row.dataElevation !== undefined && (
									<span className="block text-xs font-normal text-slate-500">
										~{row.dataElevation} m nearby
									</span>
								)}
						</th>
						<RowCells row={row} selected={selected} onSelect={onSelect} />
					</tr>
				))}
			</tbody>
		</table>
	);
}

function RowCells({
	row,
	selected,
	onSelect,
}: {
	row: ActivityRow;
	selected: CellRef | null;
	onSelect: (cell: CellRef) => void;
}) {
	const wide = `${cell} bg-slate-50 text-left text-slate-500`;
	if (!row.available) {
		return (
			<td colSpan={7} className={wide}>
				Data temporarily unavailable
			</td>
		);
	}
	if (row.days.every((d) => d.state === "NOT_APPLICABLE")) {
		return (
			<td colSpan={7} className={wide}>
				Not applicable — {row.days[0]?.reasons[0] ?? "not available here"}
			</td>
		);
	}
	return row.days.map((day) => (
		<td key={day.date}>
			<DayCell
				day={day}
				best={day.date === row.bestDay}
				open={selected?.activity === row.activity && selected.date === day.date}
				onClick={() => onSelect({ activity: row.activity, date: day.date })}
			/>
		</td>
	));
}

function DayCell({
	day,
	best,
	open,
	onClick,
}: {
	day: Day;
	best: boolean;
	open: boolean;
	onClick: () => void;
}) {
	const look = dayLook(day);
	return (
		<button
			type="button"
			aria-expanded={open}
			onClick={onClick}
			className={`${cell} ${look.className} cursor-pointer hover:brightness-95 ${
				open ? "ring-2 ring-sky-500 ring-offset-1" : ""
			} ${best ? "outline-2 outline-amber-400" : ""}`}
		>
			{look.word}
			{best && (
				<>
					<span aria-hidden="true"> ★</span>
					<span className="sr-only">, best day</span>
				</>
			)}
		</button>
	);
}
