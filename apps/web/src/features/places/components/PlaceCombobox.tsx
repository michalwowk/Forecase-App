import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Field,
	Label,
} from "@headlessui/react";
import { useState } from "react";
import {
	MIN_QUERY_LENGTH,
	type PlaceOption,
	usePlaceSearch,
} from "@/features/places/hooks/usePlaceSearch.ts";
import { placeLabel } from "@/features/places/utils/placeLabel.ts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue.ts";

export const SEARCH_DEBOUNCE_MS = 300;

export function PlaceCombobox({
	selected,
	onSelect,
}: {
	selected: PlaceOption | null;
	onSelect: (place: PlaceOption) => void;
}) {
	const [text, setText] = useState("");
	const typed = text.trim();
	const query = useDebouncedValue(typed, SEARCH_DEBOUNCE_MS);
	const search = usePlaceSearch(query);
	const active = typed.length >= MIN_QUERY_LENGTH;
	const settling = typed !== query || search.isFetching;
	const matches = active && !settling ? (search.data ?? []) : [];

	return (
		<Field className="relative w-full max-w-xl">
			<Label className="mb-1 block text-sm font-medium text-slate-700">
				Place
			</Label>
			<Combobox
				value={selected}
				by="id"
				onChange={(place) => {
					if (place) {
						onSelect(place);
					}
				}}
				onClose={() => setText("")}
			>
				<ComboboxInput
					className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
					placeholder="Search a city or town"
					displayValue={(place: PlaceOption | null) =>
						place ? placeLabel(place) : ""
					}
					onChange={(event) => setText(event.target.value)}
				/>
				{active && (
					// Status and Retry live inside the popup: its mousedown keeps focus in the input.
					<ComboboxOptions
						modal={false}
						className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
					>
						{matches.map((place) => (
							<ComboboxOption
								key={place.id}
								value={place}
								className="cursor-pointer px-3 py-2 data-focus:bg-sky-100 data-selected:font-semibold"
							>
								{placeLabel(place)}
							</ComboboxOption>
						))}
						{matches.length === 0 && (
							<SearchStatus
								text={typed}
								settling={settling}
								failed={search.isError}
								onRetry={() => search.refetch()}
							/>
						)}
					</ComboboxOptions>
				)}
			</Combobox>
		</Field>
	);
}

function SearchStatus({
	text,
	settling,
	failed,
	onRetry,
}: {
	text: string;
	settling: boolean;
	failed: boolean;
	onRetry: () => void;
}) {
	const box = "px-3 py-2 text-slate-600";
	if (settling) {
		return (
			<p role="status" className={box}>
				Searching…
			</p>
		);
	}
	if (failed) {
		return (
			<div role="alert" className={`${box} flex items-center justify-between`}>
				<span>Search unavailable</span>
				<button
					type="button"
					onClick={onRetry}
					className="rounded border border-slate-300 px-2 py-0.5 text-sm hover:bg-slate-50"
				>
					Retry
				</button>
			</div>
		);
	}
	return (
		<p role="status" className={box}>
			No place called “{text}”
		</p>
	);
}
