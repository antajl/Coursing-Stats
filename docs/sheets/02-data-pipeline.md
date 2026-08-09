---
title: Data Pipeline
verified: 2026-08-09
---

# 02 — Data Pipeline

## Purpose

Как данные попадают в CDN и почему на проде бывает «пустой рейтинг».

## Truth table

| Факт | |
|------|--|
| Канон | `data/v1/` в git |
| Generated для Pages | `frontend/public/data/v1/` (gitignore) через `copy-data` |
| Indexes | Не править вручную — `build-all-data` |
| Как строятся indexes | JSON → **in-memory SQLite** (`openDb`), не stale `pc-db.sqlite` |
| Calendar UI | `calendar/{year}.json` + `indexes/calendar-index.json` / `events-by-id.json` |
| Protocol page | `/event/:id` читает `events-by-id[id].results_file` → `competitions/…json` |
| events-by-id collisions | Prefer entry with `has_results` / `results_file`; also alias id from `…/{compId}-slug.json` so `/event/1552` works when calendar id is `YYYYMMDD` |
| Show indexes в CI | Обычно **не** пересобираются (нет local RKF); ship committed `data/v1/shows/indexes/*` |
| Local без RKF archive | Skip show rebuild — иначе можно уничтожить BIS |

### Дерево (сжато)

```
data/v1/
  manifest.json, breeds.json, ui-flags.json
  calendar/{year}.json
  competitions/{year}/{month}/{id}-{slug}.json   # results[] внутри
  dogs/by-id|by-key/
  donino/speed_records.json | coursing_records.json
  indexes/*                                      # sport derived
  shows/indexes/* | shows/calendar-rkf/ | ...
```

### Pipeline (`yarn run build-all-data`)

1. rebuild calendar  
2. `build-data-snapshot`  
3. `build-derived-indexes` (+ assert tops/judges)  
4. Elo extract/generate/verify  
5. show indexes **если** local RKF есть  
6. `frontend/scripts/copy-data.js`  
7. `verify-publish-gates` (+ `--public`)

### Publish-gates

- results &gt; 0, tops/judges non-empty, season top, file ≤ **24.5 MB**
- Исключения: `backend/scripts/publish/publish-exclude.js` (синхрон с `copy-data`)

### Что уезжает на Pages (после Phase A)

| Путь | На Pages? | Почему |
|------|-----------|--------|
| `calendar/`, `indexes/` (tops, events-by-id, dog-profiles, …), `donino/`, `competitions/` | да | горячее CDN |
| `shows/calendar-*`, `shows/indexes/*` (кроме oversized) | да | списки/календари |
| `shows/exhibitions/*` bulk (~5k) | **нет** | Turso; на CDN только allowlist из `shows/index.json` (~90 LC) |
| `dogs/by-id/` | **нет** | сайт читает `indexes/dog-profiles/` |
| huge `dog-ranking-*`, sqlite, registries | **нет** | лимиты / backend-only |

Ожидаемый бюджет data-файлов после A: ~10–12k (было ~17.5k) + prerender HTML (dogs/events/hubs). План: `docs/superpowers/plans/2026-08-09-cdn-publish-slim.md`.

## Key files

- `backend/scripts/build-all-data.ts`
- `backend/scripts/publish/publish-exclude.js`
- `backend/scripts/publish/verify-publish-gates.ts`
- `frontend/scripts/copy-data.js`
- `frontend/src/lib/staticData/` + `hooks/useStaticData.ts`

## Workflows

```bash
yarn run build-data-snapshot
yarn run build-all-data
yarn run publish-gates
```

После правок `competitions/`, `dogs/` или `calendar/` — **обязательно** `build-all-data` (или как минимум `rebuild-calendar-index` если только календарь).

Импорт archive Full_Results → `competitions/`:

```bash
npx tsx backend/scripts/import/import-full-results-archive.ts
npx tsx backend/scripts/import/sync-archive-comps-to-calendar.ts   # results_file + has_results
yarn run build-all-data
```

## Pitfalls — empty ranking на проде

1. Прод читает **indexes**, не сырые `competitions/*.json`.  
2. Проверяй CDN `count` / `items`, не только HTTP 200.  
3. Причина часто: indexes собраны без `results[]` (load path).  
4. Донино **независимо** от sport results.
5. Новые `competitions/*.json` **не видны в табе календаря**, пока в `calendar/{year}.json` нет строки с `results_file` / `has_results` и не пересобран `events-by-id`.

## See also

[03-competitions](03-competitions.md) · [04-shows](04-shows.md) · [11-testing](11-testing.md) · ADR-003
