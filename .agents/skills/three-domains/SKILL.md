---
name: three-domains
description: >
  Маршрутизация CoursingStats по Соревнованиям, Выставкам и Донино. Используй когда область неясна,
  идентичность собак/судей пересекает разделы, или нужно выбрать CDN vs Turso.
  Активируется для соревнований, выставок, Донино, профилей собак, рейтингов, судей.
  Routes CoursingStats across Competitions, Shows, and Donino. Use when scope is unclear,
  dog/judge identity spans sections, or deciding CDN vs Turso. Triggers on competitions,
  shows, exhibitions, donino, dog profiles, rankings, judges.
---

# Three Domains — Routing

## When to use

- User asks about "the site" without specifying section
- Task touches dog profiles, judges, or rankings
- Need to decide data source (CDN vs Turso)
- Linking entities across domains

## Domain map

```
/competitions          → Sport (coursing, BZMP, racing)
/shows                 → Exhibitions (RKF)
/speed-records         → Donino measurements
/dog/:id               → Unified profile (sport + optional show + optional donino columns)
/donino-dog/:name/:breed → Donino-only profile
```

## Identity rules

| Entity | Competitions | Shows | Donino |
|--------|-------------|-------|--------|
| Dog ID | `dog_id` (1–999999) | show id or hash ≥1M | name+breed slug |
| Same name? | Can match show dog | Can match sport dog | Unlikely overlap |
| Judges | `indexes/judges-*` | `shows/indexes/judges.json` | None |
| Link sport↔show | `dog_links` (planned), `competition_dog_id` in show indexes | Same | N/A |
| Link sport↔donino | `dog_id` field in donino JSON | N/A | Optional |

## Data sources

| Feature | Competitions | Shows | Donino |
|---------|-------------|-------|--------|
| Calendar | `calendar/{year}.json` | `shows/calendar-rkf/` | — |
| Rankings | `indexes/top-*` | `shows/indexes/dog-ranking-{year}.json` | inline in JSON |
| Protocols | `competitions/...json` | Turso + JSON fallback | — |
| Profiles | `indexes/dog-profiles/` | `show-dog-lookup/` shards | filter by name+breed |

## Pick the right skill

| Task | Skill |
|------|-------|
| Sport rankings, calendar, parsers | `competitions-domain` |
| RKF PDF, show ranking, Turso | `shows-domain` |
| Speed/coursing records | `donino-domain` |
| build-all-data, indexes | `coursing-stats-dev` |
| Parser changes | `coursing-stats-parsers` |
| Bot commands | `bot-add-handler` |

## Top open gap

Sport ↔ show dog linkage incomplete. See skill `sport-show-linkage` and `docs/sheets/01-three-domains.md`.
