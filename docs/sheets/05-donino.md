---
title: Donino
verified: 2026-08-06
---

# 05 — Donino

## Purpose

Замеры в Донино — отдельный namespace идентичности (кличка + порода), не путать со спортом/выставками.

## Truth table

| Файл | Смысл | Единицы |
|------|--------|---------|
| `data/v1/donino/speed_records.json` | Скорость на курсинг-трассе | **км/ч** |
| `data/v1/donino/coursing_records.json` | 350 м гладкая | **секунды** |

**Никогда не смешивать** две дисциплины в одной таблице/метрике.

| Route | |
|-------|--|
| `/speed-records` | UI записей |
| `/donino-dog/:name/:breed` | Профиль только Донино |

Связь со спортом — только если в записи есть `dog_id`.

## Key files

- `frontend/src/pages/SpeedRecords*` (и связанные)
- `backend/scripts/speed/fetch-speed-records.ts`
- `backend/scripts/speed/export-speed-from-sheets.ts`
- `backend/scripts/speed/export-coursing-from-sheets.ts`
- `.github/workflows/update-speed-records.yml` — **2×/day** (05:00 & 17:00 UTC)

## Workflows

```bash
yarn run fetch-speed-records
yarn run export-donino-speed
yarn run export-donino-coursing
yarn run export-donino
```

Донино **не** зависит от `build-derived-indexes` спорта для отображения своих JSON.

## Pitfalls

- Документы «4×/day cron» — устарели; workflow = 2×.
- Не использовать sport `dog_id` как ключ профиля Донино по умолчанию.

## See also

[01-three-domains](01-three-domains.md) · skill `donino-domain`
