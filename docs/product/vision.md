# Vision

## Problem
- You're planning the week. You know the town. You don't know which day is best for what.
- Raw forecasts (temperature, wind, rain, swell) don't answer "should I go surfing on Thursday?".

## User
- Someone deciding when to do an activity in a given place, in the next 7 days.

## The answer we show
- Enter a place → see the resolved place (name, country) so you know we got the right one.
- For each activity (skiing, surfing, outdoor sightseeing, indoor sightseeing): a score per day, days ranked.
- Each score has a short reason ("strong wind", "fresh snow"). A number alone isn't understandable.
- Clear "not suitable here" when an activity doesn't fit the place (no snow, no coast).

## How it works
- Web app → GraphQL API → Open-Meteo (geocoding + forecast, marine data for surf).
- API owns the scoring. Web only displays. Rules in `scoring.md`.
- No database. One Open-Meteo round per request.

## Non-goals
- Persistence, accounts, auth.
- Visual polish.
- Forecasts beyond 7 days. Activities beyond the four.

## Stack
- pnpm monorepo: `apps/api` (Node, TS, graphql-yoga), `apps/web` (Vite, React, TS). Vitest. See D-004.

## Open questions
- Ambiguous names (Paris FR vs Paris TX): pick first match or let user choose?
- Whose timezone defines "a day"? Likely the place's.
- Inland place + surfing: score 0, or "not applicable"?
- Skiing: snow depth vs snowfall vs altitude — what data is there? → `0002`.
- Indoor sightseeing: score = how bad outside is? Or flat-ish?
