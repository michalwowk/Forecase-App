const ROWS = 4;
const DAYS = 7;

// Same 4 × 7 shape as WeekGrid, so the page doesn't jump when data arrives.
export function GridSkeleton() {
	return (
		<div role="status" aria-busy="true" className="animate-pulse">
			<span className="sr-only">Loading forecast…</span>
			<div aria-hidden="true" className="grid grid-cols-8 gap-1 w-fit">
				{Array.from({ length: ROWS * (DAYS + 1) }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder cells
						key={i}
						className={`h-12 rounded-md bg-slate-200 ${i % (DAYS + 1) === 0 ? "w-28" : "w-24"}`}
					/>
				))}
			</div>
		</div>
	);
}
