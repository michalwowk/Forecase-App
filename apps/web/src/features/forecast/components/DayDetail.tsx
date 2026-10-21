import type {
	ActivityRow,
	Day,
} from "@/features/forecast/hooks/useForecast.ts";
import { ACTIVITY_NAMES, dayLook } from "@/features/forecast/utils/labels.ts";
import { formatDayLong } from "@/utils/dates.ts";

/** Detail of one cell, from data already loaded. */
export function DayDetail({ row, day }: { row: ActivityRow; day: Day }) {
	const { word } = dayLook(day);
	const verdict = day.score === null ? word : `${word} (${day.score})`;

	return (
		<section
			aria-label="Day detail"
			className="mt-4 max-w-xl rounded-md border border-slate-200 bg-white p-4 shadow-sm"
		>
			<h2 className="font-semibold">
				{formatDayLong(day.date)} · {ACTIVITY_NAMES[row.activity]} · {verdict}
			</h2>
			<ul className="mt-2 list-disc pl-5 text-slate-700">
				{day.reasons.map((reason) => (
					<li key={reason}>{reason}</li>
				))}
			</ul>
			{day.keyValues.length > 0 && (
				<dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 text-sm">
					{day.keyValues.map((kv) => (
						<div key={kv.label} className="contents">
							<dt className="text-slate-500">{kv.label}</dt>
							<dd>
								{kv.value} {kv.unit}
							</dd>
						</div>
					))}
				</dl>
			)}
			{row.dataElevation !== null && row.dataElevation !== undefined && (
				<p className="mt-3 text-sm text-slate-500">
					Data for ~{row.dataElevation} m in the mountains nearby
				</p>
			)}
		</section>
	);
}
