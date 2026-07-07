# Архив данных Coursing Stats

Локальное файловое хранилище снимков D1 — для бэкапа и будущего перехода на свою схему БД.

## Снимки (`snapshots/`)

Каждый запуск `npm run export-archive` создаёт папку `snapshots/YYYY-MM-DDTHH-mm-ss/`:

| Путь | Содержимое |
|------|------------|
| `manifest.json` | метаданные, счётчики, покрытие по годам |
| `snapshot/full-dump.sql` | полный SQL-дамп D1 (восстановление одной командой) |
| `snapshot/d1-schema.sql` | копия `backend/schema.sql` на момент экспорта |
| `tables/*.json` | таблицы D1 как есть (1 файл = 1 таблица) |
| `by-year/events/{year}.json` | события по годам |
| `by-year/results/{year}.json` | результаты с вложенным `event` и `dog` |
| `competitions/{id}.json` | одно соревнование + все строки результатов |
| `donino/*.json` | рекорды скорости и курсинга (Google Sheets) |
| `indexes/dogs-by-id.json` | справочник собак по id |

JSON-поля (`raw_scores_json`, `history`, `track_schemes`) разворачиваются в объекты, где возможно.

## Целевая схема v1 (`_schema/v1/`)

Черновик **будущей** файловой структуры (не текущий D1). Использовать при переделке парсинга.

## Не коммитить

`snapshots/` в `.gitignore` — большие файлы. В git только этот README и `_schema/`.

## Команды

```bash
# Экспорт с production D1 (по умолчанию)
npm run export-archive

# Из локальной D1
npm run export-archive -- --local

# Указать папку
npm run export-archive -- --output data/archive/snapshots/manual-run
```

Восстановление из SQL:

```bash
npx wrangler d1 execute pc-db --local --file=data/archive/snapshots/.../snapshot/full-dump.sql --yes
```
