---
title: Racing Standards (Бега борзых)
verified: 2026-09-28
---

# 13 — Racing Standards (Бега борзых)

## Purpose

Эталонные правила хранения и отображения данных для бегов борзых (racing).

## Truth table — Racing event structure

| Поле | Правило | Пример |
|------|---------|--------|
| `event_type` | Всегда `"racing"` для бегов | `"racing"` |
| `competition_kind` | Тип соревнования | `"Чемпионат России"`, `"Клубный чемпионат"` |
| `competition_type` | Тип деятельности | `"Бега борзых"` |
| `dog.sex` | Пол собаки (из TSV протокола) | `"Кобель"`, `"Сука"` |
| `dog.sex_icon` | Иконка пола | `"♂"` для кобеля, `"♀"` для суки |
| `breed_class` | Порода - Класс - **Кворум** | `"Салюки - Стандартный - Микс"` |
| **Кворум (Микс)** | Если в породе+классе <3 собак любого пола → `"Микс"` | 2 кабеля + 3 суки = Микс |
| **Кворум (раздельный)** | Если ≥3 собак пола → раздельный кворум | 15 кабелей уиппет = `"Уиппет - Стандартный - Кобель"` |
| `total_score` | = `grand_total` из протокола (не делить на судей) | `30.86` |
| `total_starts` | Считаются finished + disqualified (участвовали) | Не считать DNS/неявка |
| `placement` | Место в протоколе | `1`, `2`, `null` для DQ/DNS |
| `status` | Статус участия | `"finished"`, `"disqualified"`, `"withdrawn"`, `"dns"` |
| `status_reason` | Причина DQ/withdrawal | `"Агрессия"`, `"Неявка"` |
| `qualification` | Титулы из протокола | `"Чемпион России, CACLBr, RegCACL"` |
| `raw_scores_json.heats` | Забеги: номер дорожки, попона, время, скорость | 3 забега для большинства собак |

## Racing heat structure

```json
{
  "heat_number": 1,
  "bib_number": 15,        // Номер дорожки (из колонки "Забег")
  "bib_color": "45",      // Цвет/номер попоны (из колонки "Попона")
  "time": 11.34,          // Время в секундах
  "speed_kmh": 40.830     // Скорость км/ч
}
```

## Sex & Mix Rules (Важно!)

### Правило кворума по полу
- **Раздельный кворум** (Кобель/Сука): только если в породе+классе ≥3 собак ОДНОГО пола
- **Микс**: если в породе+классе <3 собак любого пола

### Примеры
| Порода | Кобели | Суки | Кворум |
|--------|--------|------|--------|
| Уиппет | 15 | 14 | Раздельный (≥3 каждого) |
| Салюки | 2 | 3 | Микс (кабелей <3) |
| Русская псовая борзая | 1 | 2 | Микс (кабелей <3) |
| Фараонова собака | 1 | 2 | Микс (кабелей <3) |
| Поденко ибиценко | 0 | 2 | Сука (кабелей 0) |
| Тазы | 2 | 0 | Кобель (сук 0) |

### Breed_class format
- Раздельный: `"Порода - Класс - Кобель"` или `"Порода - Класс - Сука"`
- Микс: `"Порода - Класс - Микс"`

### Dog sex (не путать с кворумом!)
- `dog.sex` — всегда конкретный пол собаки из протокола (Кобель/Сука)
- `dog.sex_icon` — иконка пола собаки (♂/♀)
- `breed_class` — кворум соревнования (может быть Микс даже если sex=Кобель)

## Dog profile linking

### Matching rules
- Совпадение по **полному имени + породе**
- Поддерживаются форматы имён:
  - Только русский: `"ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА"`
  - Только английский: `"EMUL DE GEPARD GELILA AL RAWDA"`
  - Комбинированный: `"ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА / EMUL DE GEPARD GELILA AL RAWDA"`
- Пол (sex) может использоваться для уточнения, но не overriding name+breed

### Creating new profiles
- Если собаки нет в базе → создать профиль
- Новые ID: продолжать с текущего максимума (последний: 10754)
- Профиль содержит:
  - `dog.id`, `dog.name_lat`, `dog.name_ru`, `dog.breed`, `dog.sex`
  - `competitions[]` с event 2022000
  - `racing_stats` для финишеров (total_starts, best_speed, avg_speed)

## Data source hierarchy

1. **Authoritative source**: TSV протокол (например `protocol_full_transcription_rechecked.tsv`)
2. **Parsers**: `backend/scripts/import/parse-protocol-tsv.ts` → `data/v1/2022000-results-temp.json`
3. **Event file**: `data/v1/competitions/2026/09-сентябрь/2022000-чемпионат-россии-по-бегам-борзых.json`
4. **Indexes**: `data/v1/indexes/*` (сгенерированы через `build-all-data`)
5. **Frontend**: `frontend/public/data/v1/*` (скопировано через `copy-data`)

## Build pipeline

```bash
# После изменений протокола
npx tsx backend/scripts/import/parse-protocol-tsv.ts
npx tsx backend/scripts/import/match-dogs-to-protocol.ts
npx tsx backend/scripts/import/copy-results-simple.ts
yarn run build-all-data  # Обязательно!
```

## Frontend display rules

### DogSexIcon component
- Проверяет `sex === 'Сука'` или `sex === 'С'` → показывает ♀ (розовый)
- Проверяет `sex === 'Кобель'` или `sex === 'К'` → показывает ♂ (серый)
- Поддерживает полные слова и сокращения

### Never do (forbidden)
- ❌ Изменять `dog.sex` на "Микс" — только `breed_class`
- ❌ Делить `total_score` на число судей
- ❌ Смешивать медали и CS очки в одно число
- ❌ Использовать Elo для сортировки календаря
- ❌ Считать DNS/неявка в `total_starts`
- ❌ Редактировать индексы вручную — только через `build-all-data`

## Key files

- `backend/scripts/import/parse-protocol-tsv.ts` — TSV парсер
- `backend/scripts/import/match-dogs-to-protocol.ts` — сопоставление собак
- `backend/scripts/import/create-dog-profiles-from-protocol.ts` — создание профилей
- `backend/scripts/import/copy-results-simple.ts` — копирование результатов
- `backend/scripts/build-all-data.ts` — пересбор индексов
- `frontend/src/components/DogSexIcon.tsx` — иконка пола
- `data/v1/competitions/{year}/{month}/{id}-{slug}.json` — соревнования
- `data/v1/indexes/dog-profiles/pack-*.json` — профили собак

## See also

[03-competitions](03-competitions.md) · [06-parsers](06-parsers.md) · [02-data-pipeline](02-data-pipeline.md)
