/** 12.0 → 12, 4.83 → 4.8 with 1 decimal. */
export function roundTo(value: number, decimals: number): number {
	return Number(value.toFixed(decimals));
}

/** Replace `{value}` in a config text. */
export function fillText(text: string, value: string): string {
	return text.replaceAll("{value}", value);
}

/** Replace `{value}` with a number rounded for display. */
export function fillValue(
	text: string,
	value: number,
	decimals: number,
): string {
	return fillText(text, String(roundTo(value, decimals)));
}
