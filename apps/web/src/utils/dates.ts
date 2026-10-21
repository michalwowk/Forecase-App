// API dates are local calendar days ("2026-10-21"). Formatting in UTC keeps the day as-is in any browser timezone.
const parts = new Intl.DateTimeFormat("en-US", {
	timeZone: "UTC",
	weekday: "short",
	day: "numeric",
	month: "short",
});

function dateParts(date: string) {
	const found = parts.formatToParts(new Date(`${date}T00:00:00Z`));
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		found.find((p) => p.type === type)?.value ?? "";
	return { weekday: part("weekday"), day: part("day"), month: part("month") };
}

/** Grid column header, e.g. "Wed 21". */
export function formatDayShort(date: string): string {
	const { weekday, day } = dateParts(date);
	return `${weekday} ${day}`;
}

/** Day detail heading, e.g. "Wed 21 Oct". */
export function formatDayLong(date: string): string {
	const { weekday, day, month } = dateParts(date);
	return `${weekday} ${day} ${month}`;
}
