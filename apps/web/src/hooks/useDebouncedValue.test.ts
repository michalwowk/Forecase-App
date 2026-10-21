import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";

describe("useDebouncedValue", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("updates only after the value stops changing", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "In" } },
		);
		rerender({ value: "Inn" });
		act(() => vi.advanceTimersByTime(299));
		expect(result.current).toBe("In");

		rerender({ value: "Inns" });
		act(() => vi.advanceTimersByTime(299));
		expect(result.current).toBe("In");

		act(() => vi.advanceTimersByTime(1));
		expect(result.current).toBe("Inns");
	});
});
