# Целевая файловая схема v1 (черновик)

Отделение от Cloudflare D1 и от привязки к таблицам `events` / `results` / `dogs`.

## Принципы

1. **Соревнование — атом хранения.** Один JSON (или JSONL) на состязание, не размазанные JOIN.
2. **Собака — справочник.** Каноническая кличка + порода + стабильный `dog_key` (slug), не auto-increment id.
3. **Источник сохраняется.** `source.url`, `source.scraped_at`, `source.parser_version` — для перепарсинга.
4. **Сырые данные рядом.** `raw.html_path` или `raw.row_text` не выбрасывать при новом парсинге.

## Предлагаемая структура каталогов

```
data/v1/
  manifest.json                 # версия схемы, дата сборки, статистика
  breeds.json                   # справочник пород (опционально)
  dogs/
    by-key/{dog_key}.json       # профиль собаки (имена, порода, владелец, ссылки)
  competitions/
    {year}/
      {event_key}.json          # метаданные + results[] + judges + tracks
  donino/
    speed/{breed}.json          # или один файл — по усмотрению
    coursing/{breed}.json
  sources/
    procoursing/
      calendar/{year}.json      # только календарь, без результатов
      html/{event_key}.html     # кэш HTML протоколов (опционально)
```

## Формат `competitions/{year}/{event_key}.json`

```json
{
  "schema_version": 1,
  "event_key": "2025-coursing-chrkf-donino-05-17",
  "year": 2025,
  "discipline": "coursing",
  "date_start": "2025-05-17",
  "title": "...",
  "location": "...",
  "rank": "ЧРКФ",
  "judges": ["Лукина Д.М.", "..."],
  "source": {
    "results_url": "https://www.procoursing.ru/...",
    "catalog_url": null,
    "scraped_at": "2026-07-01T12:00:00Z",
    "parser": "coursing-v2"
  },
  "results": [
    {
      "dog_key": "woken-up-in-high-heels",
      "name_lat": "WOKEN UP IN HIGH HEELS",
      "name_ru": null,
      "breed": "Уипет",
      "breed_class": "Уипет - Стандартный - Сука",
      "placement": 1,
      "total_score": 298,
      "qualification": "CACL",
      "status": "finished",
      "scores": { }
    }
  ]
}
```

`event_key` — стабильный slug из даты + типа + нормализованного title (без зависимости от id в SQLite).

## Маппинг из текущего D1

| D1 | v1 |
|----|-----|
| `events` + `results` + `dogs` | один файл `competitions/{year}/{id}.json` в снимке → миграция в `event_key` |
| `dogs.id` | `dog_key` = slug(`name_lat`, `breed`) |
| `results.raw_scores_json` | `results[].scores` |
| `speed_records` / `coursing_records` | `donino/` (отдельный источник — Google Sheets) |

Текущий экспорт (`snapshots/.../competitions/`) — промежуточный шаг: уже «одно соревнование = один файл», но с числовыми id из D1.
