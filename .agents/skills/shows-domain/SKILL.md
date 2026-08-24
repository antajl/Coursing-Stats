---
name: shows-domain
description: >
  Выставки CoursingStats — календарь РКФ, рейтинг собак, судьи выставок, протоколы Turso, интерфейс /shows.
  Используй для выставок, рейтинга выставок, PDF РКФ, ID собак выставок, НЕ для соревнований.
  CoursingStats exhibitions — RKF calendar, dog-ranking, show judges, Turso protocols, /shows UI.
  Use for exhibition, show ranking, RKF PDF, show dog IDs, not sport competitions.
---

# Shows Domain

## Scope

RKF exhibition calendar, dog rankings, judge stats, exhibition protocols. **Separate judges and dog IDs from competitions.**

## Routes & pages

| Route | Component |
|-------|-----------|
| `/shows?tab=ranking` | `Shows.tsx` → `ShowRanking.tsx` |
| `/shows?tab=judges` | `ShowJudges.tsx` |
| `/shows?tab=calendar` | `ShowCalendar.tsx` |
| `/shows/exhibition/:id` | `ShowExhibitionDetail.tsx` |
| `/shows/judges/:judgeId` | `ShowJudgeDetail.tsx` |
| `/dog/:id` (id ≥ 1M) | Show-only dogs via unified profile |

## Data architecture

| Feature | Source |
|---------|--------|
| Ranking by year | CDN `shows/indexes/dog-ranking-{year}.json` |
| Dog lookup | CDN shards `show-dog-lookup/{0-f}.json` |
| Judges | CDN `shows/indexes/judges.json` |
| RKF calendar | CDN `shows/calendar-rkf/{year}.json` |
| Exhibition protocols | **Turso** (primary) + JSON fallback |
| LC legacy (~90) | CDN `shows/exhibitions/*.json` |

Frontend: `frontend/src/lib/staticData/shows.ts`, `turso.ts`

Env: `VITE_TURSO_URL`, `VITE_TURSO_AUTH_TOKEN`

## Critical identity rule

**RKF show id ≠ competition dog_id.** Numeric matches are coincidental.

Planned linkage: Turso `dog_links` table (competition_dog_id ↔ show_dog_id).

Show-only dogs: stable hash id ≥ 1_000_000 → `/dog/{id}`.

## Size limits

- Cloudflare Pages: **25 MB per file**
- All-time show ranking too large → year shards only
- `show-dog-lookup` sharded into 16 parts

## PDF pipeline

```bash
yarn run download-rkf-reports
yarn run parse-rkf-reports
yarn run rebuild-show-year    # or rebuild-show-snapshot
```

Key parser: `backend/parsers/shows/parse-rkf-certificate-pdf.ts` (barrel → `rkf-cert/`)
Award ranking: `backend/lib/show-award-ranking.ts` (barrel → `show-awards/`)
Frontend loaders: `frontend/src/lib/staticData/shows.ts` (barrel → `shows/{calendar,ranking,judges,home}.ts`)

- Type1: breed catalog from PDF
- Type3 (main ring): 2025–2026 only → BIS/BIG badges
- Tests: `backend/tests/parse-rkf-certificate-pdf.test.ts`

## Current status (2026)

- 2026+2025 PDF mostly done
- 2024 parse ~60%, 2023→2019 not started
- Turso sync workflow broken locally (`exhibitions-rkf-archive.sqlite` missing)
- Ranking perf: see `docs/sheets/04-shows.md` (lean indexes / sharding)

## Docs

- `docs/sheets/04-shows.md`
- `docs/decisions/007-exhibitions-rkf-sqlite-migration.md`
- `docs/decisions/009-turso-migration.md`
