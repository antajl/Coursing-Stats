---
title: Donino
verified: 2026-10-26
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
| `/speed-records?tab=records` | UI записей |
| `/speed-records?tab=stats` | Статистика по породам/годам/полу |
| `/donino-dog/:name/:breed` | Профиль только Донино |
| `/dog/:id` | Колонки Донино при наличии `dog_id` |

Связь со спортом — безопасное сопоставление через `findSportDogId` (`match-donino-dog.ts`).

## Google Sheets Sources & Semantics

- **Бега 350 м** (Таблица 1):
  - Лист: `'2026'`.
  - История хранится в примечаниях Google Sheets к ячейкам даты (`^([\d.,]+)\s*-\s*(.+)$`).
  - Фоновые цвета (`#CCCCCC` / `#FFFFFF`) — полосатая зебра, не статус.
- **Замеры скорости** (Таблица 2):
  - Листы: `'2026'`, `'2025'`, `'старые личные рекорды'`, `'Абсолютный зачёт'`.
  - Листы вида `.*по породам` (например `'2025 по породам'`) игнорируются как 100% дубликаты.
  - Лист `'Абсолютный зачёт'` парсится как страховочная сеть с дедупликацией по скриншоту/дате.
  - Цвета: `#FFFF00` (желтый) — улучшение рекорда в последнем заезде (`improved`); `#B6D7A8` (зеленый) — новая собака в последнем заезде (`new`); `#9FC5E8` (голубой) — улучшение ранее в сезоне (`improved`).
  - История скорости хранится в виде строк на листе `'старые личные рекорды'` (не в примечаниях!).

## Key files

- `frontend/src/pages/SpeedRecords*`
- `frontend/src/pages/DoninoDogProfile.tsx`
- `backend/scripts/speed/export-speed-from-sheets.ts`
- `backend/scripts/speed/export-coursing-from-sheets.ts`
- `backend/scripts/speed/parse-speed-xlsx.ts`
- `backend/scripts/speed/parse-coursing-xlsx.ts`
- `backend/scripts/speed/match-donino-dog.ts`
- `.github/workflows/update-speed-records.yml` — **2×/day** (05:00 & 17:00 UTC / 08:00 & 20:00 МСК)

## Workflows

```bash
yarn run export-donino-speed
yarn run export-donino-coursing
yarn run export-donino
```

Донино **не** зависит от `build-derived-indexes` спорта для отображения своих JSON.

## Pitfalls

- Документы «4×/day cron» — устарели; workflow = 2×.
- 1 собака (`name + breed`) = ровно 1 верхнеуровневая запись в JSON с массивом `history`.
- Не отфильтровывать собаку при выборе года, если её лучший заезд был в другом году (брать лучший заезд *внутри выбранного года*).

## See also

[01-three-domains](01-three-domains.md) · skill `donino-domain`
