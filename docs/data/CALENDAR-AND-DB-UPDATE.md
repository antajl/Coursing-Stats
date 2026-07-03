# Календарь и обновление D1 — практическое руководство

> **Дата:** 2026-07-03  
> **Контекст:** исправление календаря 2025 (и сохранение корректности 2026) + перепарсинг результатов.  
> **Связанные файлы:** `PARSING.md` (детали HTML), `DATABASE.md` (схема), `DEVELOPMENT.md` (скрипты).

---

## Зачем это было нужно

На procoursing.ru календарь 2025 отличался от нашего:

| Проблема на сайте | Причина в старом коде |
|-------------------|------------------------|
| Нет БЗМП 3 авг Донино | Одна строка таблицы = две дисциплины; скрапер брал только первую |
| Даты `5 апр` вместо `5–6 апр` | `date_end` парсился, но UI показывал только `date_start` |
| Нет `[отменён]` | Не выводилось в UI |
| Часть 2025 без результатов | Старый скрапер искал только «Полные результаты»; пропускал «Результаты состязания»; `event_type` брался из каталога |

**Приоритет:** календарь и `results_url` — от них зависят все результаты, рейтинги, профили собак.

---

## Архитектура (источник правды)

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

---

## Правила скрапера календаря

### Одна строка таблицы = одно событие

Не разбивать мультидисциплинарные строки (пример: 2025-08-03 Донино — курсинг + БЗМП в одном `rank_label` с переносами `\n` из `<br>`).

### `rank_label`

- Сохранять переносы строк (`rankLabelFromCell`)
- `[отменён]` / `[отменен]` остаётся в тексте; флаг `cancelled: true` в объекте скрапера
- UI: `isEventCancelled()`, бейдж «Отменён», `getEventHeadline()` собирает заголовок из строк

### Даты

- `parseDateRange`: `18-19.04.2026` → `date_start` + `date_end`
- UI: `formatRowDateParts(date_start, date_end)` → `5–6 апр`

### `results_url` и `event_type`

- **Только из ссылки на результаты**, не из каталога
- Принимаются: `_Complete_Results_*.html`, текст «результат» (в т.ч. «Результаты состязания»)
- **Исключаются:** `_by_Runs`, `_by_Breed`
- `event_type` из суффикса файла: `_C_` / `_B_` / `_R_` (см. `typeFromHref`)

### Уникальный `title` для БД

В схеме: `UNIQUE(date_start, title, location, event_type)`.

Старые форматы (6 ячеек) давали `title = location` → коллизии при нескольких дисциплинах в один день.  
Функция `deriveUniqueTitle()` в скрапере строит уникальный title, напр. `ЧРКФ (Курсинг борзых)` или `Курсинг на Ярославке — Кубок России (БЗМП)`.

**В UI заголовок берётся из `rank_label` (`getEventHeadline`), не из `title`.** `title` — в основном для ключа в БД.

### Форматы таблицы по числу ячеек

| Ячеек | Годы | title | host_club |
|-------|------|-------|-----------|
| 6 | 2015–2024 | = location | пусто |
| 7 | 2025 | = host_club | из ячейки 2 |
| 8 | 2026+ | из ячейки 2 | из ячейки 3 |

Подробнее: `docs/data/PARSING.md` → «Парсинг календаря событий».

---

## Загрузка событий (`load-events.ts`)

### Upsert

- С `results_url` → `ON CONFLICT(results_url) DO UPDATE`
- Без `results_url` → `ON CONFLICT(date_start, title, location, event_type) DO UPDATE`
- `date_end`: `NULL` в SQL, **не** строка `'null'`

### Имя базы D1

В `wrangler.toml`: `database_name = "pc-db"`. Команды:

```bash
npx wrangler d1 execute pc-db --local --file=./data/imports/load-events.sql
npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql
```

### После исправления `results_url`

События с **новым** URL могут получить **новый `id`** в D1 (INSERT вместо UPDATE по старому ключу).  
Пример (2026-07-03): NSB-события 2025-09-20/21 — старые id 1515/1516, новые 2662/2663.

**Важно:** SQL перепарсинга, сгенерированный с **локальной** D1, может ссылаться на устаревшие `event_id`.  
Решение: генерировать reparse **после** `load-events` и **с той же БД**, куда будете заливать:

```bash
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --remote
# или --local для dev
```

---

## Перепарсинг результатов

### Команды

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

### Известные пропуски (2025, 2026-07-03)

| Событие | Причина |
|---------|---------|
| `Complete_Results_2025-09-20_B_NSB.html` | Парсер BZMP вернул 0 записей (формат NSB) |
| `Complete_Results_*_Best_Time.pdf` | PDF, не HTML |
| `event_type: other` (Котейка Глюк и т.п.) | reparse пропускает неизвестный тип |

---

## Remote D1: лимиты и ошибка `D1_RESET_DO`

### Симптом

```
X [ERROR] {"D1_RESET_DO":true}
```

### Что это

Durable Object, хранящий D1, **перезапустился** во время bulk import. Wrangler показывает общий код вместо конкретной SQL-ошибки.

### Типичные причины

1. **Слишком большой файл** — наш `reparse-2025.sql` ~6.7 MB, ~4289 запросов с тяжёлым JSON/HTML в `raw_text`
2. Нарушение UNIQUE / FOREIGN KEY во время импорта (тоже может маскироваться под `D1_RESET_DO`)
3. Реже — зависший import endpoint на стороне Cloudflare

`load-events.sql` (225 коротких upsert) на remote **проходит нормально**.

### Решение: батчи

```bash
# 1. Разбить по блокам событий (каждый блок начинается с DELETE FROM results WHERE event_id = …)
npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql

# Создаёт data/updates/reparse-2025-batches/batch-01.sql … batch-09.sql (~5 событий в файле)

# 2. Заливать по очереди на remote
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2025-batches/batch-01.sql
# … batch-02 … batch-09
```

Проверено 2026-07-03: 9 батчей, все загружены на production D1.

### FOREIGN KEY при батче

Если `event_id` в SQL не существует в целевой БД (см. раздел про новые id после `load-events`) — явная ошибка:

```
FOREIGN KEY constraint failed
```

Исправить id в SQL или перегенерировать reparse с `--remote`.

---

## Полный workflow (чеклист)

### 1. Тесты календаря

```bash
npx vitest run backend/tests/calendar-scrape.test.ts
```

Обновить фикстуры при изменении вёрстки procoursing.ru:

```bash
npx tsx backend/scripts/test/download-calendar-fixtures.ts
```

**Фикстуры только через `fetchWin1251`** — curl без декодирования даёт битую кириллицу.

### 2. Скрап

```bash
npm run scrape-index
# → data/events/events.json (225 событий на 2026-07-03)
```

### 3. SQL событий

```bash
npm run load-events
# → data/imports/load-events.sql
```

### 4. Заливка событий

```bash
npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql
```

### 5. Перепарсинг (на той же БД!)

```bash
npx tsx backend/scripts/reparse/reparse-by-year.ts 2025 --remote
# → data/updates/reparse-2025.sql
```

### 6. Заливка результатов батчами

```bash
npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql
for ($i=1..9) { npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2025-batches/batch-{0:D2}.sql }
```

### 7. Проверка

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

---

## Фронтенд: отображение календаря

- Заголовок строки: `getEventHeadline(event)` из `rank_label`, не `title`
- Подзаголовок пород: `getEventSubtitle()` — строки между рангом и `(Дисциплина)`
- Дата: `formatRowDateParts` + `dayEnd` для диапазона
- Отмена: `isEventCancelled` → бейдж, приглушённый стиль
- Дисциплина: цвет левого бордера (`DISCIPLINE_BORDER`), БЗМП — синий `blue-*`

---

## Что НЕ ломать

- **2026** — тест `calendar-scrape.test.ts` проверяет count и date range Казани
- Два рейтинга (медали / очки) — не объединять
- API путь `/api/competitions`, не `/events`
- `total_score` = исходная `grand_total`, не делить на число судей

---

## История сессии 2026-07-03

1. Новый модуль `scrape-year-page.ts`, тесты, фикстуры
2. UI: диапазоны дат, отменённые события, заголовки из `rank_label`
3. `load-events.ts`: NULL `date_end`, upsert по `results_url`, `deriveUniqueTitle`
4. `update-current-year.ts` → общий парсер
5. Полный скрап + local D1 + reparse 2025 local
6. Remote: `load-events` OK; monolithic `reparse-2025.sql` → `D1_RESET_DO`
7. Split на 9 батчей → remote OK; batch-09 потребовал замену id 1516→2663
