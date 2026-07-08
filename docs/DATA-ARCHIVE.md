# Data Archive — Файловый архив данных

Локальное хранилище снимков D1 для бэкапа и импорта в `data/v1/`.

> **Runtime сайта** — `data/v1/` в git (CDN). D1 и архив — для импорта/бэкапа. Подробно: [DATA.md](DATA.md), [DATABASE.md](DATABASE.md).

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

## Покрытие данных (актуально на 2026-07-08)

| Сущность | Количество | Примечание |
|----------|------------|------------|
| events | 320+ | календарь 2015–2026 |
| competitions с results | 105+ | протоколы в БД + web-archive |
| dogs | 1500+ | |
| results | 5600+ | в основном 2022–2026 (включая web-archive) |
| speed_records | 191 | Google Sheets |
| coursing_records | 107 | Google Sheets 350 м |
| breeds | 86 | |
| judges (таблица) | 0 на remote | судьи в `events.judges`, API `/api/judges` |

**2015–2024:** события в календаре есть; детальные `results` для 2022–2024 добавлены из web-archive (web.archive.org). 2015–2021 — только события без результатов (на procoursing — JPG, OCR не делали).

## Web Archive Integration (2026-07-08)

В июле 2026 года выполнена интеграция данных из web.archive.org для восстановления исторических результатов 2022–2024 годов.

**Источники:**
- Календари: `WebArchiveResults/calendars-cleaned/*.html` (очищенные от баннеров web.archive.org)
- Результаты: `WebArchiveResults/cleaned/{year}/` (очищенные HTML страниц результатов)
- Парсинг: существующие парсеры (coursing, bzmp, racing) с windows-1251 декодированием

**Добавленные данные:**
- **2022:** 1 событие, 33 результата
- **2023:** 22 события, 1233 результата
- **2024:** 26 событий, 1423 результата

**Итого:** 49 событий, 2689 результатов из web-archive

**Процесс интеграции:**
1. Скачаны календари и страницы результатов с web.archive.org
2. Удалены баннеры и скрипты web.archive.org из HTML
3. Протестированы существующие парсеры на очищенных файлах
4. Распарсены результаты и экспортированы в JSON по годам
5. Интегрированы в `data/v1/calendar/{year}.json` и `data/v1/competitions/{year}/{month}/`
6. Пересобраны индексы (calendar-index, top-placement/score/speed, dog-profiles)

**Скрипты интеграции:**
- `backend/scripts/web-archive/extract-results-urls.ts` — извлечение ссылок результатов из календарей
- `backend/scripts/web-archive/download-results.ts` — скачивание страниц результатов
- `backend/scripts/web-archive/clean-web-archive-html.ts` — очистка HTML от баннеров
- `backend/scripts/web-archive/test-parsers-on-web-archive.ts` — тестирование парсеров
- `backend/scripts/web-archive/parse-and-export.ts` — парсинг и экспорт в JSON
- `backend/scripts/web-archive/cleanup-2024-calendar.ts` — очистка календаря от дубликатов
- `backend/scripts/web-archive/add-missing-2024-events.ts` — добавление недостающих событий
- `backend/scripts/web-archive/clean-calendar-html.ts` — очистка календарей от баннеров

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
