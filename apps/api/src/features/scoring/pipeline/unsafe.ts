import type { UnsafeTrigger } from "@/features/scoring/config/schema.ts";
import { compare, mostExtreme } from "@/features/scoring/pipeline/compare.ts";
import { fillValue } from "@/features/scoring/pipeline/text.ts";
import { anyHourIn, rangeValues } from "@/features/scoring/pipeline/values.ts";
import type { HourRange } from "@/features/scoring/pipeline/windows.ts";
import type { HourlySeries } from "@/features/scoring/types.ts";

/** Reason text if the trigger fires in any hour of the range, else null. */
function check(
	trigger: UnsafeTrigger,
	series: HourlySeries,
	range: HourRange,
): string | null {
	if (trigger.kind === "anyHourIn") {
		return anyHourIn(series, trigger.field, range, trigger.values)
			? trigger.reason
			: null;
	}
	const hits = rangeValues(series, trigger.field, range).filter((v) =>
		compare(trigger.op, v, trigger.value),
	);
	if (hits.length === 0) return null;
	const worst = mostExtreme(trigger.op, hits);
	return fillValue(trigger.reason, worst, trigger.decimals);
}

/** Reason of the first trigger that fires in the window, or null if the day is safe. */
export function unsafeReason(
	series: HourlySeries,
	range: HourRange,
	triggers: UnsafeTrigger[],
): string | null {
	for (const trigger of triggers) {
		const reason = check(trigger, series, range);
		if (reason) return reason;
	}
	return null;
}
