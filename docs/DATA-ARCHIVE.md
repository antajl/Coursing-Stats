# Data Archive — Файловый архив данных

Локальное хранилище снимков D1 для бэкапа, переноса на другой сервер и будущего перехода на **свою файловую схему** (независимость от procoursing.ru для **чтения** уже распарсенных данных).

> Текущая рабочая БД — Cloudflare D1. Архив — **копия**, не замена D1. Подробности текущей схемы: `DATABASE.md`.

## Быстрый старт

```bash
# Экспорт с production D1 (по умолчанию)
npm run export-archive

# Из локальной D1
npm run export-archive -- --local

# Своя папка
npm run export-archive -- --output data/archive/snapshots/manual-run
```

Скрипт: `backend/scripts/export/export-data-archive.ts`

## Куда складывается

```
data/archive/snapshots/YYYY-MM-DDTHH-mm-ss/
```

Папка `data/archive/snapshots/` в `.gitignore` — **не коммитить** (большие файлы).

В git остаются:
- `data/archive/README.md` — краткая справка
- `data/archive/_schema/v1/README.md` — черновик **целевой** файловой схемы
- этот файл (`docs/DATA-ARCHIVE.md`)

## Структура снимка

| Путь | Назначение |
|------|------------|
| `manifest.json` | дата, счётчики, покрытие по годам |
| `README.md` | краткое описание снимка |
| `snapshot/full-dump.sql` | полный SQL-дамп D1 (восстановление) |
| `snapshot/d1-schema.sql` | копия `backend/schema.sql` на момент экспорта |
| `tables/*.json` | таблицы D1 как есть (1 файл = 1 таблица) |
| `by-year/events/{year}.json` | календарь по годам |
| `by-year/results/{year}.json` | результаты с вложенными `event` и `dog` |
| `competitions/{id}.json` | **одно соревнование = один JSON** (event + results[]) |
| `donino/speed_records.json`, `coursing_records.json` | рекорды Донино |
| `donino/speed_by_breed/`, `coursing_by_breed/` | разбивка по породам |
| `indexes/dogs-by-id.json`, `events-by-id.json` | справочники для lookup |

JSON-поля (`raw_scores_json`, `history`, `track_schemes`) разворачиваются в объекты, где возможно.

## Покрытие данных (актуально на 2026-07-07)

| Сущность | Количество | Примечание |
|----------|------------|------------|
| events | 225 | календарь 2015–2026 |
| competitions с results | 56 | протоколы в БД |
| dogs | 1628 | |
| results | 2966 | в основном 2025–2026 |
| speed_records | 213 | Google Sheets |
| coursing_records | 107 | Google Sheets 350 м |
| judges (таблица) | 0 на remote | судьи в `events.judges`, API `/api/judges` |

**2015–2024:** события в календаре есть; детальные `results` в БД **нет** (на procoursing — JPG, OCR не делали).

## Восстановление из SQL

```bash
npx wrangler d1 execute pc-db --local --file=data/archive/snapshots/.../snapshot/full-dump.sql --yes
```

Для remote — только осознанно, с бэкапом (`DATABASE.md`).

## Целевая схема v1 (будущее)

Черновик **новой** файловой структуры (не D1):

`data/archive/_schema/v1/README.md`

Идея:
- `competitions/{year}/{event_key}.json` — стабильный slug, не numeric id
- `dogs/by-key/{dog_key}.json` — каноническая собака
- `source.results_url` — ссылка на procoursing сохраняется как **источник**, не как зависимость UI

Текущий экспорт `competitions/{id}.json` — промежуточный формат (v0), удобен для перепарсинга и ручной проверки.

## Связь с procoursing.ru

| Что | Зависимость |
|-----|-------------|
| Показ сайта из архива / D1 | **Нет** — данные локальные |
| Обновление новых соревнований | **Да** — пока парсер ходит на procoursing |
| Полная история 2015–2024 в таблицах | **Нет** — не распарсено |

## См. также

- `DATABASE.md` — D1, импорт, лимиты, кэш API
- `PARSING.md` — откуда берутся данные
- `FUTURE-PLANS.md` — миграция на data v1
