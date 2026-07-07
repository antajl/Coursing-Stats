# Database — Работа с БД

> **ИИ:** runtime данные — [DATA.md](DATA.md); этот файл — **D1** (импорт, парсеры, cron).

Документация по **Cloudflare D1** (импорт, парсеры, cron) и связи с **`data/v1/`** (runtime сайта).

> **Runtime публичного сайта** — `data/v1/` в git → CDN. D1 remote может отставать. Актуальные счётчики для сайта: `data/v1/manifest.json`. Подробно: `docs/DATA.md`.

## Загрузка результатов

### Через API (рекомендуется для будущих разработок)

Для загрузки результатов используется API эндпоинт `/api/admin/import-results`:

```bash
npx tsx backend/scripts/load/load-results.ts data/events/events.json http://127.0.0.1:8787/api/admin/import-results YOUR_ADMIN_API_TOKEN
```

**Преимущества API подхода:**
- Пакетная обработка данных (batch processing)
- Валидация данных на сервере
- Логирование ошибок
- Масштабируемость
- Автоматическое обновление событий с судьями и схемами трасс

### Через SQL (текущий метод)

Для разовой загрузки больших объемов данных:

```bash
# 1. Экспорт из local базы по таблицам
npx wrangler d1 export pc-db --local --table=dogs --output=data/exports/dogs.sql --no-schema
npx wrangler d1 export pc-db --local --table=events --output=data/exports/events.sql --no-schema
npx wrangler d1 export pc-db --local --table=results --output=data/exports/results.sql --no-schema

# 2. Импорт в remote базу
npx wrangler d1 execute pc-db --remote --file=data/exports/dogs.sql --yes
npx wrangler d1 execute pc-db --remote --file=data/exports/events.sql --yes
npx wrangler d1 execute pc-db --remote --file=data/exports/results.sql --yes
```

## Важные правила безопасности

**ПЕРЕД ЛЮБЫМ УДАЛЕНИЕМ ДАННЫХ:**
1. **Всегда делайте бекап** в отдельную папку `data/backups/` с датой
   ```bash
   npx wrangler d1 export pc-db --remote --output=data/backups/remote-backup-YYYY-MM-DD.sql
   ```
2. **Всегда используйте флаг `--yes`** для автоматического подтверждения команд wrangler
   ```bash
   npx wrangler d1 execute pc-db --remote --command="DELETE FROM events" --yes
   ```
3. Проверьте, что в базе реальные данные, а не мусор перед удалением

## Schema

Полная схема БД находится в `backend/schema.sql`.

### events

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| year | INTEGER | Год события |
| date_start | TEXT | Дата начала (YYYY-MM-DD) |
| date_end | TEXT | Дата окончания (YYYY-MM-DD, null для однодневных) |
| rank_label | TEXT | Ранг ('ЧРКФ', 'CACL', 'РКФ' и т.п.) |
| event_type | TEXT | 'coursing' \| 'bzmp' \| 'racing' |
| competition_kind | TEXT | Вид соревнования: ЧРКФ, ПЧРКФ, CACL и т.д. (до скобок) |
| competition_type | TEXT | Тип соревнования: Курсинг борзых, БЗМП и т.д. (в скобках) |
| title | TEXT | Название состязания |
| host_club | TEXT | Принимающая организация |
| region | TEXT | Регион |
| location | TEXT | Место проведения |
| catalog_url | TEXT | Ссылка на каталог PDF |
| results_url | TEXT UNIQUE | Ссылка на результаты (естественный ключ) |
| confirmed | INTEGER | Флаг подтверждения ('+') |
| last_modified | TEXT | Last-Modified заголовок для инкрементальных обновлений |
| scraped_at | TEXT | Время скрапинга |
| telegram_url | TEXT | Ссылка на Telegram |
| full_title | TEXT | Полное название из заголовка |
| event_date | TEXT | Дата события из заголовка (DD.MM.YYYY) |
| protocol_location | TEXT | Локация из заголовка протокола |
| judges | TEXT | Информация о судьях (JSON или строка) |
| track_schemes | TEXT | Схемы трасс (JSON массив с URL и названиями) |

**UNIQUE Constraints:**
- `results_url` — для событий с ссылками на результаты
- `(date_start, title, location, event_type)` — для предотвращения дубликатов событий без results_url

**Indexes:**
- `idx_events_year` на `year`
- `idx_events_type` на `event_type`

### dogs

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| name_lat | TEXT | Каноническое имя латиницей |
| name_ru | TEXT | Имя на русском |
| breed | TEXT | Порода |
| sex | TEXT | 'M' \| 'F' |
| pedigree_no | TEXT | Номер родословной |
| microchip | TEXT | Микрошильд |
| owner | TEXT | Владелец |
| pedigree_url | TEXT | Ссылка на внешний архив родословных |
| merged_into_dog_id | INTEGER FK | Для ручной склейки дублей |
| created_at | TEXT | Время создания |

**UNIQUE:** `(name_lat, breed)`

**Indexes:**
- `idx_dogs_breed` на `breed`

### judges

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| name | TEXT UNIQUE | Имя судьи |
| created_at | TEXT | Время создания |

**Indexes:**
- `idx_judges_name` на `name`

### results

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| event_id | INTEGER FK | Ссылка на events |
| dog_id | INTEGER FK | Ссылка на dogs |
| breed_class | TEXT | Заголовок группы ('Афганская - Стандартная - Сука') |
| catalog_no | INTEGER | Каталожный номер |
| placement | INTEGER | Место (NULL если не финишировал) |
| total_score | REAL | Нормализованный итоговый балл (для coursing/bzmp) |
| judge_count | INTEGER | Количество судей на соревновании (для нормализации) |
| qualification | TEXT | 'CACL, RegCACL' и т.п. |
| vc | TEXT | Статус '+' или пусто |
| status | TEXT | 'finished' \| 'disqualified' \| 'withdrawn' \| 'dns' |
| raw_scores_json | TEXT | JSON с детальными данными (баллы или скорость) |
| raw_text | TEXT | Исходная строка для отладки |
| judges | TEXT | Информация о судьях из строки результата |
| status_reason | TEXT | Причина статуса (disqualification, dns и т.д.) |

**UNIQUE:** `(event_id, dog_id, breed_class)`

**Indexes:**
- `idx_results_dog` на `dog_id`
- `idx_results_event` на `event_id`

### speed_records

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| breed | TEXT | Порода |
| sex | TEXT | 'С' (сука) или 'К' (кабель) |
| name | TEXT | Кличка |
| speed_km_h | REAL | Скорость в км/ч |
| date | TEXT | Дата в формате DD.MM.YYYY |
| screenshot_url | TEXT | Ссылка на скриншот |
| history | TEXT | JSON с предыдущими результатами |
| status | TEXT | `new`, `improved`, `normal`, `old` (цвет клички на листе; см. `speed-sheet-status.ts`) |
| updated_at | TEXT | Время последнего обновления |

**history структура:**
```json
[
  {
    "speed_km_h": 58.5,
    "date": "15.03.2025"
  }
]
```

**Indexes:**
- `idx_speed_records_breed` на `breed`
- `idx_speed_records_speed` на `speed_km_h DESC`

### coursing_records

Зачёты **бегов борзых 350 м** из [отдельного Google Sheet](https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw). Не путать с `speed_records`.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| breed | TEXT | Порода |
| name | TEXT | Кличка |
| time_seconds | REAL | Время на 350 м (сек) |
| date | TEXT | Дата (`YYYY-MM-DD` после синка) |
| track_length | INTEGER | 350 |
| history | TEXT | JSON предыдущих результатов |
| dog_id | INTEGER FK | Связь с `dogs` (опционально) |

**Скорость для UI:** `1260 / time_seconds` км/ч (`recordDates.ts`).

**Indexes:**
- `idx_coursing_records_breed` на `breed`
- `idx_coursing_records_time` на `time_seconds ASC`

---

## Views

### v_top_by_placement

Топ по местам — "медальный зачёт": сортировка по золоту, потом серебру, потом бронзе.

```sql
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  e.year,
  SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
  SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
  SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
  COUNT(*) AS total_starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
GROUP BY d.id, e.year
ORDER BY e.year DESC, gold DESC, silver DESC, bronze DESC;
```

### v_top_by_score

Топ по очкам — лучший результат, средний балл и число стартов вместе.

```sql
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  e.year,
  MAX(r.total_score) AS best_score,
  ROUND(AVG(r.total_score), 2) AS avg_score,
  COUNT(*) AS total_starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
GROUP BY d.id, e.year
ORDER BY e.year DESC, best_score DESC;
```

---

## Migrations

### Структура миграций

Миграции хранятся в:
- `backend/schema.sql` — базовая схема
- `backend/data/migrations/` — миграции (если будет структурировано)
- `backend/data/` — текущие SQL файлы миграций

### Примеры миграций

**Добавление колонки judges:**
```sql
ALTER TABLE events ADD COLUMN judges TEXT;
```

**Добавление колонки track_schemes:**
```sql
ALTER TABLE events ADD COLUMN track_schemes TEXT;
```

**Нормализация кличек:**
- Скрипт: `backend/scripts/migrate/migrate-normalize-dog-names.ts`

**Нормализация total_score:**
- Скрипт: `backend/scripts/archive/migrate-normalize-existing-scores.mjs`

---

## Data Import/Export

### Загрузка событий

```bash
npm run scrape-index    # procoursing.ru → data/events/events.json
npm run load-events     # → data/imports/load-events.sql
npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql
```

Скрипт: `backend/scripts/load/load-events.ts`

**Upsert:**
- С `results_url` → `ON CONFLICT(results_url) DO UPDATE`
- Без `results_url` → `ON CONFLICT(date_start, title, location, event_type) DO UPDATE`
- `date_end`: SQL `NULL`, не строка `'null'`

**После смены `results_url`:** событие может получить новый `id` в D1. Перепарсинг SQL нужно генерировать **после** load-events и с **той же** БД (`--remote` / `--local`). Подробнее см. секцию «Календарь и обновление D1» в этом файле.

### Перепарсинг результатов (SQL-файлы)

```bash
npm run reparse-2025                              # remote D1 по умолчанию
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --local

# Большие файлы — батчами на remote (см. секцию «Календарь и обновление D1» в этом файле)
npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2025-batches/batch-01.sql
```

**Ошибка `{"D1_RESET_DO":true}`** при `--file` на remote — файл слишком большой для одного import (~6 MB reparse). Решение: `split-sql-batches.ts`.

### Загрузка результатов (legacy API)

```bash
npm run load-results
```

Скрипт: `backend/scripts/load/load-results.ts`

### Экспорт данных

Экспорт в SQL файлы:
- `data/sync-events.sql` — экспорт событий
- `data/sync-results.sql` — экспорт результатов
- `data/sync-dogs.sql` — экспорт собак

---

## Sync Local ↔ Remote

### Локальная D1

```bash
cd backend
npx wrangler d1 execute pc-db --local --file=../data/sync-local-to-remote.sql
```

### Remote D1

```bash
cd backend
npx wrangler d1 execute pc-db --file=../data/sync-local-to-remote.sql
```

### Скрипт синхронизации

```bash
npm run sync-to-remote
```

Скрипт: `backend/scripts/sync/sync-local-to-remote.ts`

**Параметры:**
- `--push` — push local → remote
- `--pull` — pull remote → local

---

## Текущее состояние

### Runtime (`data/v1/`, 2026-07-07) — источник для сайта

| Сущность | Количество |
|----------|------------|
| events (календарь) | 389 |
| competitions с results | 56 |
| dogs | 1532 |
| results | 2958 |
| donino_speed | 191 |
| donino_coursing | 107 |
| breeds | 86 |

Файл: `data/v1/manifest.json`

### Remote D1 (`pc-db`) — импорт, может отличаться

**Календарь и reparse 2025 обновлены на remote 2026-07-03** (см. секцию «Календарь и обновление D1»).

Ориентировочно на remote (не синхронизировано с `data/v1/` автоматически):

- **events:** ~225 (календарь в D1)
- **dogs:** ~1628
- **results:** ~2966 (2025–2026)
- **speed_records:** ~213
- **coursing_records:** 107
- **Remote D1:** ~21 MB

**Распределение results по годам (D1):**
- 2025: 2114 результатов (50 событий)
- 2026: 852 результатов (51 событие)
- 2015–2024: НЕДОСТУПНЫ (хранятся как изображения, требуется OCR)

После правок в D1: `npm run export-local-data` → `build-all-data` → git push.

---

## D1 Free tier (импорт / dev:d1)

**Лимит Cloudflare D1 (Free):** ~5M **rows read** в сутки на аккаунт.

**Снижение нагрузки при работе с D1:**
- `npm run dev` — **не использует D1** (читает `data/v1/`)
- `npm run dev:d1` / `dev:remote` — Worker + D1 (legacy)
- `backend/src/lib/edge-cache.ts` — кэш GET на Worker (актуален только для `dev:d1` / legacy prod API)

**Локальная разработка (обычная):** `npm run dev` → `data/v1/` на диске. D1: `sync-from-remote` → `export-local-data` при необходимости импорта.

**Файловый бэкап:** `npm run export-archive` — см. `DATA-ARCHIVE.md`.

**Таблица `judges`:** на remote **отсутствует**; статистика судей агрегируется из `events.judges` и `results.raw_scores`. Отдельная materialized-таблица — в планах (`FUTURE-PLANS.md`).

---

## Raw Scores JSON

### Coursing/БЗМП

```json
{
  "heats": [
    {
      "heat_number": 1,
      "bib_number": 30,
      "bib_color": "red",
      "judges": [
        {
          "name": "Иванов И.И.",
          "scores": [18, 19, 17, 18, 19],
          "total": 91
        }
      ],
      "total": 91
    },
    {
      "heat_number": 2,
      "bib_number": 50,
      "bib_color": "blue",
      "judges": [...],
      "total": 93
    }
  ],
  "grand_total": 184,
  "raw_total": 184,
  "normalized_score": 92
}
```

### Racing

```json
{
  "heat1": {
    "bib_number": 30,
    "bib_color": "red",
    "time": 21.88,
    "speed": 16.45
  },
  "heat2": { ... },
  "heat3": { ... },
  "distance": 480
}
```

Скорость в м/с, конвертируется в км/ч в API (×3.6).

---

## Календарь и обновление D1 — практическое руководство

> **Дата:** 2026-07-03  
> **Контекст:** исправление календаря 2025 (и сохранение корректности 2026) + перепарсинг результатов.  
> **Связанные файлы:** `PARSING.md` (детали HTML), `DEVELOPMENT.md` (скрипты).

### Зачем это было нужно

На procoursing.ru календарь 2025 отличался от нашего:

| Проблема на сайте | Причина в старом коде |
|-------------------|------------------------|
| Нет БЗМП 3 авг Донино | Одна строка таблицы = две дисциплины; скрапер брал только первую |
| Даты `5 апр` вместо `5–6 апр` | `date_end` парсился, но UI показывал только `date_start` |
| Нет `[отменён]` | Не выводилось в UI |
| Часть 2025 без результатов | Старый скрапер искал только «Полные результаты»; пропускал «Результаты состязания»; `event_type` брался из каталога |

**Приоритет:** календарь и `results_url` — от них зависят все результаты, рейтинги, профили собак.

### Архитектура (источник правды)

```
procoursing.ru/s_{YEAR}.html
        ↓ fetchWin1251 (windows-1251!)
backend/parsers/calendar/scrape-year-page.ts
        ↓
data/events/events.json          (gitignored)
        ↓ load-events.ts
data/imports/load-events.sql
        ↓ wrangler d1 execute
D1 events

results_url из events
        ↓ reparse-by-year.ts (v2 модульные парсеры)
data/updates/reparse-{YEAR}.sql
        ↓ wrangler d1 execute (батчами!)
D1 results
```

### Ключевые файлы

| Файл | Назначение |
|------|------------|
| `backend/parsers/calendar/scrape-year-page.ts` | Парсер HTML календаря (модуль) |
| `backend/scripts/scrape/scrape-year-index.ts` | CLI: все годы 2015–2026 → `events.json` |
| `backend/scripts/update/update-current-year.ts` | Инкрементальное обновление текущего года (тот же парсер) |
| `backend/scripts/load/load-events.ts` | JSON → SQL upsert |
| `backend/scripts/load/split-sql-batches.ts` | Разбивка большого SQL на батчи для remote D1 |
| `backend/scripts/reparse/reparse-by-year.ts` | Перепарсинг результатов по году |
| `backend/tests/calendar-scrape.test.ts` | Регрессионные тесты календаря |
| `backend/tests/fixtures/calendar/s_*.html` | Фикстуры (скачивать через `download-calendar-fixtures.ts`) |
| `frontend/src/pages/Events/eventListUtils.ts` | Отображение: даты, заголовки, отмена |
| `frontend/src/pages/Events/EventListRow.tsx` | Строка календаря |
| `frontend/src/components/HomeEventRow.tsx` | Строка на главной |

### Правила скрапера календаря

#### Одна строка таблицы = одно событие

Не разбивать мультидисциплинарные строки (пример: 2025-08-03 Донино — курсинг + БЗМП в одном `rank_label` с переносами `\n` из `<br>`).

#### `rank_label`

- Сохранять переносы строк (`rankLabelFromCell`)
- `[отменён]` / `[отменен]` остаётся в тексте; флаг `cancelled: true` в объекте скрапера
- UI: `isEventCancelled()`, бейдж «Отменён», `getEventHeadline()` собирает заголовок из строк

#### Даты

- `parseDateRange`: `18-19.04.2026` → `date_start` + `date_end`
- UI: `formatRowDateParts(date_start, date_end)` → `5–6 апр`

#### `results_url` и `event_type`

- **Только из ссылки на результаты**, не из каталога
- Принимаются: `_Complete_Results_*.html`, текст «результат» (в т.ч. «Результаты состязания»)
- **Исключаются:** `_by_Runs`, `_by_Breed`
- `event_type` из суффикса файла: `_C_` / `_B_` / `_R_` (см. `typeFromHref`)

#### Уникальный `title` для БД

В схеме: `UNIQUE(date_start, title, location, event_type)`.

Старые форматы (6 ячеек) давали `title = location` → коллизии при нескольких дисциплинах в один день.  
Функция `deriveUniqueTitle()` в скрапере строит уникальный title, напр. `ЧРКФ (Курсинг борзых)` или `Курсинг на Ярославке — Кубок России (БЗМП)`.

**В UI заголовок берётся из `rank_label` (`getEventHeadline`), не из `title`.** `title` — в основном для ключа в БД.

#### Форматы таблицы по числу ячеек

| Ячеек | Годы | title | host_club |
|-------|------|-------|-----------|
| 6 | 2015–2024 | = location | пусто |
| 7 | 2025 | = host_club | из ячейки 2 |
| 8 | 2026+ | из ячейки 2 | из ячейки 3 |

Подробнее: `PARSING.md` → «Парсинг календаря событий».

### Загрузка событий (`load-events.ts`)

#### Upsert

- С `results_url` → `ON CONFLICT(results_url) DO UPDATE`
- Без `results_url` → `ON CONFLICT(date_start, title, location, event_type) DO UPDATE`
- `date_end`: `NULL` в SQL, **не** строка `'null'`

#### Имя базы D1

В `wrangler.toml`: `database_name = "pc-db"`. Команды:

```bash
npx wrangler d1 execute pc-db --local --file=./data/imports/load-events.sql
npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql
```

#### После исправления `results_url`

События с **новым** URL могут получить **новый `id`** в D1 (INSERT вместо UPDATE по старому ключу).  
Пример (2026-07-03): NSB-события 2025-09-20/21 — старые id 1515/1516, новые 2662/2663.

**Важно:** SQL перепарсинга, сгенерированный с **локальной** D1, может ссылаться на устаревшие `event_id`.  
Решение: генерировать reparse **после** `load-events` и **с той же БД**, куда будете заливать:

```bash
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --remote
# или --local для dev
```

### Перепарсинг результатов

#### Команды

```bash
# Генерация SQL (читает event id из D1)
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --local
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --remote

# npm-алиасы
npm run reparse-2025   # по умолчанию --remote в скрипте? проверить package.json
```

Флаг `--local` / `--remote` передаётся последним аргументом (см. `reparse-by-year.ts`).

Парсеры: **v1** (`parse-results-*.ts` через `coursing/index.ts` и т.д. в reparse).  
`track_schemes` в v2 пока пустые — отдельная задача.

#### Известные пропуски (2025, 2026-07-03)

| Событие | Причина |
|---------|---------|
| `Complete_Results_2025-09-20_B_NSB.html` | Парсер BZMP вернул 0 записей (формат NSB) |
| `Complete_Results_*_Best_Time.pdf` | PDF, не HTML |
| `event_type: other` (Котейка Глюк и т.п.) | reparse пропускает неизвестный тип |

### Remote D1: лимиты и ошибка `D1_RESET_DO`

#### Симптом

```
X [ERROR] {"D1_RESET_DO":true}
```

#### Что это

Durable Object, хранящий D1, **перезапустился** во время bulk import. Wrangler показывает общий код вместо конкретной SQL-ошибки.

#### Типичные причины

1. **Слишком большой файл** — наш `reparse-2025.sql` ~6.7 MB, ~4289 запросов с тяжёлым JSON/HTML в `raw_text`
2. Нарушение UNIQUE / FOREIGN KEY во время импорта (тоже может маскироваться под `D1_RESET_DO`)
3. Реже — зависший import endpoint на стороне Cloudflare

`load-events.sql` (225 коротких upsert) на remote **проходит нормально**.

#### Решение: батчи

```bash
# 1. Разбить по блокам событий (каждый блок начинается с DELETE FROM results WHERE event_id = …)
npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql

# Создаёт data/updates/reparse-2025-batches/batch-01.sql … batch-09.sql (~5 событий в файле)

# 2. Заливать по очереди на remote
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2025-batches/batch-01.sql
# … batch-02 … batch-09
```

Проверено 2026-07-03: 9 батчей, все загружены на production D1.

#### FOREIGN KEY при батче

Если `event_id` в SQL не существует в целевой БД (см. раздел про новые id после `load-events`) — явная ошибка:

```
FOREIGN KEY constraint failed
```

Исправить id в SQL или перегенерировать reparse с `--remote`.

### Полный workflow (чеклист)

#### 1. Тесты календаря

```bash
npx vitest run backend/tests/calendar-scrape.test.ts
```

Обновить фикстуры при изменении вёрстки procoursing.ru:

```bash
npx tsx backend/scripts/test/download-calendar-fixtures.ts
```

**Фикстуры только через `fetchWin1251`** — curl без декодирования даёт битую кириллицу.

#### 2. Скрап

```bash
npm run scrape-index
# → data/events/events.json (225 событий на 2026-07-03)
```

#### 3. SQL событий

```bash
npm run load-events
# → data/imports/load-events.sql
```

#### 4. Заливка событий

```bash
npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql
```

#### 5. Перепарсинг (на той же БД!)

```bash
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --remote
# → data/updates/reparse-2025.sql
```

#### 6. Заливка результатов батчами

```bash
npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql
for ($i=1..9) { npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2025-batches/batch-{0:D2}.sql }
```

#### 7. Проверка

Ключевые кейсы 2025:

| Дата | Что проверить |
|------|----------------|
| 2025-04-05/06 | `date_end`, два URL `_C` / `_B` |
| 2025-08-03 | полный `rank_label` (курсинг + БЗМП), результаты на странице события |
| 2025-08-30 | `[отменён]`, бейдж в UI |
| 2025-09-20 | CACMB, ссылка `_B_NSB` в календаре |

```bash
npx wrangler d1 execute pc-db --remote --command "SELECT date_start, date_end, substr(rank_label,1,80), results_url FROM events WHERE date_start LIKE '2025-08-%'"
```

### Фронтенд: отображение календаря

- Заголовок строки: `getEventHeadline(event)` из `rank_label`, не `title`
- Подзаголовок пород: `getEventSubtitle()` — строки между рангом и `(Дисциплина)`
- Дата: `formatRowDateParts` + `dayEnd` для диапазона
- Отмена: `isEventCancelled` → бейдж, приглушённый стиль
- Дисциплина: цвет левого бордера (`DISCIPLINE_BORDER`), БЗМП — синий `blue-*`

### Что НЕ ломать

- **2026** — тест `calendar-scrape.test.ts` проверяет count и date range Казани
- Два рейтинга (медали / очки) — не объединять
- API путь `/api/competitions`, не `/events`
- `total_score` = исходная `grand_total`, не делить на число судей

### История сессии 2026-07-03

1. Новый модуль `scrape-year-page.ts`, тесты, фикстуры
2. UI: диапазоны дат, отменённые события, заголовки из `rank_label`
3. `load-events.ts`: NULL `date_end`, upsert по `results_url`, `deriveUniqueTitle`
4. `update-current-year.ts` → общий парсер
5. Полный скрап + local D1 + reparse 2025 local
6. Remote: `load-events` OK; monolithic `reparse-2025.sql` → `D1_RESET_DO`
7. Split на 9 батчей → remote OK; batch-09 потребовал замену id 1516→2663

---

## Полезные команды

### D1 CLI

```bash
# Локальная D1
npx wrangler d1 execute pc-db --local --command="SELECT * FROM events LIMIT 5"

# Remote D1
npx wrangler d1 execute pc-db --command="SELECT * FROM events LIMIT 5"

# Импорт SQL файла
npx wrangler d1 execute pc-db --file=script.sql

# Локальный импорт
npx wrangler d1 execute pc-db --local --file=script.sql

# Автоматическое подтверждение (без запроса y/n)
npx wrangler d1 execute pc-db --remote --file=script.sql --yes
```

### Пересоздание view'ов

```bash
POST /api/admin/recreate-views
Headers: X-Admin-Token: secret
```

---

## Полезные ссылки

- Schema: `backend/schema.sql`
- Миграции: `backend/data/migrations/` (если структурировано)
- Скрипт синхронизации: `backend/scripts/sync/sync-local-to-remote.ts`
- Скрипт загрузки событий: `backend/scripts/load/load-events.ts`
- Скрипт загрузки результатов: `backend/scripts/load/load-results.ts`
