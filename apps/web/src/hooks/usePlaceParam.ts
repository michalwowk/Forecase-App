import { useSyncExternalStore } from "react";

// `?place=<id>` is the source of truth for the picked place (D-028). No router.
const PARAM = "place";
const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) {
		listener();
	}
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	window.addEventListener("popstate", listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("popstate", listener);
	};
}

function readPlace(): string | null {
	return new URLSearchParams(window.location.search).get(PARAM) || null;
}

function urlWith(placeId: string | null): string {
	const url = new URL(window.location.href);
	if (placeId) {
		url.searchParams.set(PARAM, placeId);
	} else {
		url.searchParams.delete(PARAM);
	}
	return url.toString();
}

/** New history entry, so back returns to the previous place. */
export function pushPlace(placeId: string) {
	if (readPlace() === placeId) {
		return;
	}
	window.history.pushState(null, "", urlWith(placeId));
	notify();
}

/** Drops the place without a history entry (e.g. unknown id). */
export function clearPlace() {
	window.history.replaceState(null, "", urlWith(null));
	notify();
}

export function usePlaceParam(): string | null {
	return useSyncExternalStore(subscribe, readPlace);
}
