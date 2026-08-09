---
title: Shows (RKF)
verified: 2026-08-09
---

# 04 — Shows (выставки)

## Purpose

Выставки РКФ: рейтинг, календарь, судьи, протоколы PDF, Turso для больших протоколов.

## Truth table

| Что | Откуда |
|-----|--------|
| Ranking / calendar / judges / home-top | **CDN** `data/v1/shows/indexes/*`, calendar JSON |
| Протокол `/shows/exhibition/:id` | Сначала `shows/index.json` → CDN JSON (LC allowlist); miss → **Turso** `@libsql/client` |
| Bulk `shows/exhibitions/*.json` | **Не** на Pages (~5k); только ~90 из `shows/index.json` |
| ShowRanking / ShowCalendar | React Query → **CDN**, не Turso |
| All-time `dog-ranking.json` | &gt;25 MB — **не** в Pages deploy |
| Lookup | `show-dog-lookup/{0-f}.json` шарды (~обход 25 MB) |
| Show dog card | `shows/indexes/dog-details/{000-255}.json` (уже паки) |
| Show judge detail | `shows/indexes/judge-details/pack-*.json` (`byKey`) |
| Identity | show dog id **≠** competition `dog_id` |
| Calendar prod | `ui-flags.publicCalendars.shows: true` |
| Env | `VITE_TURSO_URL`, `VITE_TURSO_AUTH_TOKEN`; scripts: `.env.ai` `TURSO_*` |

### PDF pipeline (кратко)

`ingest-rkf-calendar` → `download-rkf-reports` → `parse-rkf-reports` → sync → `rebuild-show-year` / `build-show-indexes`.  
Type1 = итоговый отчёт; type3 = главный ринг (BIS/BIG) — scope 2025–2026.  
Skill: `shows-pdf-pipeline`.

Нявка (НЯ) не в рейтинг; дисквал учитывается.

## Key files

- `frontend/src/lib/staticData/shows.ts` — barrel → `shows/{calendar,ranking,judges,home}.ts`
- `frontend/src/lib/turso.ts`
- `frontend/src/pages/Shows/*` — page shells + folders `ShowExhibitionDetail/`, `ShowCalendar/`, `ShowJudgeDetail/`
- `backend/lib/show-award-ranking.ts` — barrel → `show-awards/{order,normalize,match,score}.ts`
- `backend/lib/cdn-packs.ts` — общий шардер паков
- `backend/parsers/shows/parse-rkf-certificate-pdf.ts` — barrel → `rkf-cert/*`
- `backend/scripts/shows/*`, `backend/lib/show-dog-dedupe.ts`
- `backend/tests/parse-rkf-certificate-pdf.test.ts`

## Workflows

```bash
yarn run ingest-rkf-calendar
yarn run download-rkf-reports
yarn run parse-rkf-reports
yarn run rebuild-show-year
# Turso:
yarn run turso:import-shows
```

Local без `data/local/shows/exhibitions-rkf`: **не** форсить полный show rebuild в CI-пути.

## Pitfalls

- Старые docs «ShowRanking читает Turso» — **ложно**.
- Не мерджить show judges со sport judges.
- Lean ranking без history; history в `dog-details/` при необходимости.
- Не ждать bulk exhibitions на CDN — RKF только Turso (+ LC allowlist).

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · ADR-007, ADR-009, [ADR-014](../decisions/014-cdn-packs-vs-turso.md)
