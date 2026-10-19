# Open-Meteo Geocoding API

> AI research (Claude). Facts from Open-Meteo docs and live queries on 2026-10-19. Not reviewed by a human.

Endpoint: `https://geocoding-api.open-meteo.com/v1/search`. Docs: https://open-meteo.com/en/docs/geocoding-api (below: "docs"). Queries below abbreviated as `?…`.

## Parameters (docs)
- `name` (required): place name or postal code. Optional `, <country or admin1>` qualifier.
- `count`: default 10, max 100. Filters apply before the limit.
- `language`: default `en`. Localizes `name`, `country`, `admin*`.
- `countryCode`: ISO-3166-1 alpha2 filter.
- `format`: `json` (default) or `protobuf`.
- `apikey`: only for commercial use, with a `customer-` URL prefix.
- Lookup by id: `/v1/get?id=…` (docs).

## Matching rules (docs + observed)
- 2 chars = exact name. 3+ chars = normalized prefix match. Case- and diacritic-insensitive (docs).
- Empty and 1-char queries return nothing (docs). Observed: `?name=P` → no results, HTTP 200.
- `?name=Pa&count=2` → villages named "Pa" (BF, CM). Exact match works.
- `?name=Nazare` and `?name=Nazaré` return identical results (PT first, pop 8993).
- `?name=Krakow` and `?name=Kraków` both → Kraków PL (pop 816614) first, then Krakow, Wisconsin (pop 354).
- `?name=Cracow&count=100` → only Cracow, Queensland AU (pop 198). Exonym does not find Kraków.
- `?name=Cracow, Poland` → empty.
- Qualifier needs the comma: `?name=Paris, France` → Paris FR first; `?name=Paris France` → empty.
- Qualifier must match exactly; no prefix ("Calif" fails) (docs).

## Returned fields (docs + observed)
- `id`, `name`, `latitude`, `longitude`, `elevation`, `timezone` (IANA), `feature_code` (GeoNames), `country_code`, `country`, `population`, `postcodes`, `admin1..4`, `admin*_id`, `country_id`.
- Empty fields are omitted (docs). Observed: `population` missing on Innsbruck Airport and Cape Townshend.
- Observed: `elevation: -9999.0` on Cape Townshend AU (feature `CAPE`) (`?name=Cape Town&count=2`). Sentinel, not a real value.
- Results are not only towns: `AIRP` (Innsbruck Airport), `CAPE` appear.
- `?name=Krakow&count=1&language=pl` → name "Kraków", country "Polska", admin1 "Województwo małopolskie".
- `?name=Paris&language=xx` → no error, English output (observed).

## Sample top hits (observed)
- Zakopane: PL, PPL, pop 27266, elev 819, Europe/Warsaw.
- Nazaré: PT, PPLA2, pop 8993, elev 46, Europe/Lisbon.
- Innsbruck: AT, PPLA, pop 132493, elev 570, Europe/Vienna.
- Cape Town: ZA, PPLA, pop 4772846, elev 25, Africa/Johannesburg.

## Ambiguity and ranking (observed; docs say nothing)
- `?name=Paris&count=10`: 1 FR (PPLC, 2138551), 2 TX (PPLA2, 24782), 3 TN (10150), 4 KY (9870), 5 IL (8432), 6 ME (5073), 7 MO (1176), 8 ID (PPLA2, 506), 9 AR (PPL, 3443), 10 Saint Paris OH (PPL, 2089).
- Mostly population-ordered, but not strictly: ID (506, PPLA2) ranks above AR (3443, PPL). Looks like feature-code weight, then population. Inferred only.
- Prefix matches mix in: "Nossa Senhora de Nazaré", "Cape Townshend", "Saint Paris".
- `?name=Paris&count=3&countryCode=US` → TX, TN, KY. `countryCode=ZZ` → empty, HTTP 200 (not validated).

## Empty and error shapes (observed)
- No match: HTTP 200, `{"generationtime_ms":0.059}`. No `results` key at all (`?name=Xqzzytown`).
- Error: HTTP 400, `{"error":true,"reason":"..."}` (docs). Observed `?count=3` (no name), `?name=Paris&count=0`, `?name=Paris&count=200`.
- `?name=` (empty string) → HTTP 200, no `results`.

## Attribution (docs)
- Docs page states "Location data based on GeoNames". GeoNames is CC BY 4.0 (https://www.geonames.org/export/ — not checked live today).

## Implications for us
- Missing `results` is the normal "not found" case; HTTP 400 only for bad params.
- One name can return many places; the first hit is not always the intended one (Cracow → AU village).
- `timezone` and `elevation` come with the hit; `elevation` may be `-9999`; `population` may be absent.
- Non-settlement features (airports, capes) can appear unless filtered by `feature_code`.
- "City, Country" works only with a comma and an exact qualifier; `countryCode` is the strict filter.
