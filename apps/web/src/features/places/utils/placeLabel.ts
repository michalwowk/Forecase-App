type PlaceName = {
	name: string;
	region?: string | null;
	country?: string | null;
};

/** "Innsbruck, Tyrol, Austria"; missing parts skipped. */
export function placeLabel(place: PlaceName): string {
	return [place.name, place.region, place.country].filter(Boolean).join(", ");
}
