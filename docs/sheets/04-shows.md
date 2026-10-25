---
title: Shows (RKF)
verified: 2026-10-01
---

# 04 — Shows (выставки)

## Purpose

Выставки РКФ: рейтинг, календарь, судьи, протоколы PDF, статические протоколы S3/CDN (gzip).

## Truth table

| Что | Откуда |
|-----|--------|
| Ranking / calendar / judges / home-top | **CDN** `data/v1/shows/indexes/*`, calendar JSON |
| Протокол `/shows/exhibition/:id` | Прямой fetch с S3 CDN `shows/protocols/${id}.json` (gzip); fallback: `shows/index.json` (LC allowlist) |
| Bulk протоколы выставок | Все 51 429 протоколов (2019–2026) на S3 CDN (`shows/protocols/*.json`) в gzip |
| ShowRanking / ShowCalendar | React Query → **CDN**, не Turso |
| All-time `dog-ranking.json` | &gt;25 MB — **не** в CDN deploy |
| Lookup | `show-dog-lookup/{0-f}.json` шарды (~обход 25 MB) |
| Show dog card | `shows/indexes/dog-details/{000-255}.json` (уже паки) |
| Show judge detail | `shows/indexes/judge-details/pack-*.json` (`byKey`) |
| Identity | show dog id **≠** competition `dog_id` |
| Calendar prod | `ui-flags.publicCalendars.shows: true` |
| Env | Не требуются для рантайма сайта (Turso полностью удален; протоколы на S3) |

### PDF pipeline (кратко)

`ingest-rkf-calendar` → `download-rkf-reports` → `parse-rkf-reports` → sync → `rebuild-show-year` / `build-show-indexes`.  
Type1 = итоговый отчёт; type3 = главный ринг (BIS/BIG) — scope 2025–2026.  
Skill: `shows-pdf-pipeline`.

Нявка (НЯ) не в рейтинг; дисквал учитывается.

## Key files

- `frontend/src/lib/staticData/shows.ts` — barrel → `shows/{calendar,ranking,judges,home}.ts`
- `frontend/src/pages/Shows/*` — page shells + folders `ShowExhibitionDetail/`, `ShowCalendar/`, `ShowJudgeDetail/`
- `backend/lib/show-award-ranking.ts` — barrel → `show-awards/{order,normalize,match,score}.ts`
- `backend/lib/cdn-packs.ts` — общий шардер паков
- `backend/parsers/shows/parse-rkf-certificate-pdf.ts` — barrel → `rkf-cert/*`
- `backend/scripts/shows/*`, `backend/lib/show-dog-dedupe.ts`
- `backend/scripts/repair/repair-2026-shows.ts` — ремонт пород, судей, кличек и результатов в JSON-протоколах выставок
- `backend/scripts/repair/repair-sqlite-2026.ts` — ремонт базы `exhibitions-rkf-archive.sqlite`
- `backend/tests/parse-rkf-certificate-pdf.test.ts`

## Workflows

```bash
yarn run ingest-rkf-calendar
yarn run download-rkf-reports
yarn run parse-rkf-reports
yarn run rebuild-show-year
# Выгрузка протоколов на Яндекс S3 (gzip):
npx tsx backend/scripts/shows/export-protocols-to-s3.ts --all
# Ремонт данных 2026:
npx tsx backend/scripts/repair/repair-2026-shows.ts
npx tsx backend/scripts/repair/repair-sqlite-2026.ts
```

Local без `data/local/shows/exhibitions-rkf`: **не** форсить полный show rebuild в CI-пути.

## Pitfalls

- Старые docs «ShowRanking читает Turso» — **ложно**.
- Не мерджить show judges со sport judges.
- Lean ranking без history; history в `dog-details/` при необходимости.
- Протоколы выставок на S3 CDN: все 51 429 протоколов (2019–2026) отдаются в gzip из `/data/v1/shows/protocols/{id}.json`. Turso полностью удалён из проекта.
- Числовой шум парсинга в породе (каталожные номера, возраст, e.g. `'18'`) отсекается как артефакт; `'БЕЗ ПОРОДЫ'` допустимо только если в оригинале явно указано «БЕЗ ПОРОДЫ» или «МЕТИС».
- Сортировка пород в фильтрах выставок: строго по убыванию количества собак с аккуратным алфавитным вторичным ключом.
- Для полного пересчета снапшота выставок использовать `yarn run rebuild-show-snapshot` (использует memory wrapper на 12 ГБ V8 heap).

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · ADR-007, ADR-009, [ADR-014](../decisions/014-cdn-packs-vs-turso.md)
