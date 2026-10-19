# Competitor review: forecast UIs

> AI research (Claude). Facts from public pages on 2026-10-19. Not reviewed by a human.

Fetch limits: surfline.com, support.surfline.com and accuweather.com returned HTTP 403. Surfline and AccuWeather facts come from search-index snippets of their own pages. windy.com renders client-side, so Windy facts come from its articles and community forum.

## Comparison

| App | Question it answers | Quality shown as | Explains why? | Granularity / range | Place search |
|---|---|---|---|---|---|
| Windy | What will the weather variables be here? | Raw values, maps, meteogram; no rating | No | 3 h free, 1 h Premium; ~10 d, 15 d Premium | Map click or search (incl. airports) |
| Surfline | How good is the surf at this spot? | 7 labels (Very Poor to Epic) as 1-5 coloured bars | Yes: expert daily text (Premium, 7 d) | Hourly rating; 5 d free, 16 d Premium | Per surf spot |
| Snow-Forecast | What will the weather do at this resort? | Raw values; no forecast rating | Yes: plain-text summary for days 1-3 and 4-6 | AM / PM / night; 6 d; 3 elevations | Country, then resort list |
| OnTheSnow | Where is the snow? | Snow depth % vs average; powder alerts | Weekly meteorologist note | Hour by hour (range not stated) | Search + browse by state / region / pass |
| Apple Weather | What's the weather? | Icons, rain %, high/low | No | Hourly + 10 d | Type, then pick from list |
| Google Weather | What's the weather? | Icons, rain %, high/low | No | Hourly + 10 d | Search query |
| AccuWeather indices | Is today good for activity X? | Word scale (hiking: Poor / Fair / Good / ... / Ideal) | Short tip per level | Daily | Per city |

## Notes per app
- **Windy**: free point forecast uses 3 h steps; 1 h steps need Premium ([windy.com/articles/23730](https://www.windy.com/articles/23730), [community 37970](https://community.windy.com/topic/37970/premium-vs-free-windy)). Premium adds a 15-day outlook ([windy.com/subscription](https://www.windy.com/subscription)). ECMWF/GFS up to 10 d in app ([community 30212](https://community.windy.com/topic/30212/playing-long-range-forecast-models)). Search includes airports ([community](https://community.windy.com/category/2/general-discusion)). Leaves out: any "is it good for me" verdict.
- **Surfline**: 7 ratings, Very Poor to Epic, shown as 5 bars; Good and Epic are set by hand by forecasters ([support: Surf Ratings & Colors](https://support.surfline.com/hc/en-us/articles/36277684017819-Surf-Ratings-Colors)). Without a forecaster, rating comes mainly from surf height and wind, so it can miss tide ([What's New](https://www.surfline.com/lp/whatsnew/releases/apr-25)). Ratings are relative to the spot's own potential ([surfline.com](https://www.surfline.com/surf-news/surflines-rating-surf-heights-quality/1417)). Premium: 16 d, hourly coloured rating, 7 d of expert summaries; free: 5 d ([support: Android tabs](https://support.surfline.com/hc/en-us/articles/25290157830811-Understanding-the-Live-and-Forecast-tabs-on-the-Surfline-Android-App)). Day strip shows rating at 6am, noon, 6pm; click a day for detail ([support: Spot Forecast Page](https://support.surfline.com/hc/en-us/articles/13749782983579-Understanding-the-Spot-Forecast-Page-on-the-Surfline-Website)).
- **Snow-Forecast**: 6 days x AM/PM/night; snow, rain, temp, wind chill, freezing level, wind; top/mid/base tabs; no rating in the table; two written summaries; resorts picked via country dropdown then list ([Zermatt 6-day](https://www.snow-forecast.com/resorts/Zermatt/6day/mid)).
- **OnTheSnow**: powder alert with custom threshold; browse by state/region/pass; hour-by-hour resort forecast; weekly "best snow this weekend" note; AI assistant "SkiGPT" ([onthesnow.com/mobile](https://www.onthesnow.com/mobile)).
- **Apple Weather**: 10-day list shows condition, rain chance, high/low; hourly next 24 h on Mac; search, then select from results ([support.apple.com](https://support.apple.com/en-lb/guide/weather-mac/apdw93f0ea3e/mac)). iOS: hourly for 10 days, tap a day to drill in ([support.apple.com/102594](https://support.apple.com/102594), [App Store](https://apps.apple.com/app/id1069513131)).
- **Google Weather**: hourly conditions, rain chance, alerts, 10-day outlook in the Google app ([blog.google](https://blog.google/products/search/prepare-for-next-storm-with-new-weather/)). No official help page found on how ambiguous names are resolved.
- **AccuWeather ("best day for X")**: hiking page uses a word scale Poor to Ideal with a tip per level ([accuweather.com hiking](https://www.accuweather.com/en/us/tok/99780/hiking-weather/336774), snippet only). Indices carry a value plus text description ([homey.app](https://homey.app/ko-kr/app/com.emi.accuweather/AccuWeather-Daily-Indices/)).

## Patterns worth taking (observations)
- Word label + colour, not just a number: Surfline (Very Poor to Epic) and AccuWeather (Poor to Ideal) both pair them ([Surfline](https://support.surfline.com/hc/en-us/articles/36277684017819-Surf-Ratings-Colors), [AccuWeather](https://www.accuweather.com/en/us/tok/99780/hiking-weather/336774)).
- Day strip as overview, tap/click a day for detail: Surfline, Apple ([Surfline](https://support.surfline.com/hc/en-us/articles/13749782983579-Understanding-the-Spot-Forecast-Page-on-the-Surfline-Website), [Apple](https://support.apple.com/102594)).
- Short plain-language "why" next to the numbers: Snow-Forecast summaries, Surfline expert text ([Snow-Forecast](https://www.snow-forecast.com/resorts/Zermatt/6day/mid), [Surfline](https://support.surfline.com/hc/en-us/articles/25290157830811-Understanding-the-Live-and-Forecast-tabs-on-the-Surfline-Android-App)).
- Rating relative to the place's potential, not absolute ([Surfline](https://www.surfline.com/surf-news/surflines-rating-surf-heights-quality/1417)).
- Search shows a list of matches and the user picks one ([Apple](https://support.apple.com/en-lb/guide/weather-mac/apdw93f0ea3e/mac)).

## Patterns to avoid (observations)
- Raw-variable tables with no verdict demand expert reading: Windy, Snow-Forecast table ([Windy](https://www.windy.com/articles/23730), [Snow-Forecast](https://www.snow-forecast.com/resorts/Zermatt/6day/mid)).
- Model-only ratings can miss local factors (tide), Surfline says so itself ([Surfline](https://www.surfline.com/lp/whatsnew/releases/apr-25)).
- Too many tiers: Surfline needs 7 labels on 5 bars plus a purple overflow ([Surfline](https://support.surfline.com/hc/en-us/articles/35995874238491-Observation-Clarity)).
- Single-activity apps tie search to their own spot list (surf spot, ski resort), not to any typed city ([Snow-Forecast](https://www.snow-forecast.com/resorts/Zermatt/6day/mid), [OnTheSnow](https://www.onthesnow.com/mobile)).
- None of the reviewed apps says "not suitable here" for a place; this gap was not found covered on any page reviewed.
