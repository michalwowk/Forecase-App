import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { clearPlace, pushPlace, usePlaceParam } from "@/hooks/usePlaceParam.ts";

describe("usePlaceParam", () => {
	afterEach(() => window.history.replaceState(null, "", "/"));

	it("reads the place from the URL", () => {
		window.history.replaceState(null, "", "/?place=2775220");
		const { result } = renderHook(() => usePlaceParam());
		expect(result.current).toBe("2775220");
	});

	it("is null without a place", () => {
		const { result } = renderHook(() => usePlaceParam());
		expect(result.current).toBeNull();
	});

	it("pushes a history entry and follows back", async () => {
		const { result } = renderHook(() => usePlaceParam());
		const length = window.history.length;

		act(() => pushPlace("2775220"));
		expect(result.current).toBe("2775220");
		expect(window.location.search).toBe("?place=2775220");
		expect(window.history.length).toBe(length + 1);

		act(() => window.history.back());
		await waitFor(() => expect(result.current).toBeNull());
	});

	it("clears the place without a history entry", () => {
		window.history.replaceState(null, "", "/?place=999");
		const { result } = renderHook(() => usePlaceParam());
		const length = window.history.length;

		act(() => clearPlace());
		expect(result.current).toBeNull();
		expect(window.location.search).toBe("");
		expect(window.history.length).toBe(length);
	});
});
