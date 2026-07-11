# Database Workflow — Работа с D1

> **ИИ:** схема БД — [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md). Runtime данные — [03-DATA.md](03-DATA.md).

Workflow для Cloudflare D1: импорт, синхронизация, миграции, календарь.

---

## D1 vs Локальные файлы (data/v1/)

### Когда D1 НЕ нужен

Если вы работаете только локально и загружаете данные напрямую в проект (через админку `/admin` или скрипты), **D1 вам не нужен**.

**Локальный workflow без D1:**
- Редактирование данных через админку (работает с локальными JSON файлами)
- Ручное редактирование JSON в `data/v1/`
- Запуск `npm run dev` - использует локальные файлы напрямую
- Построение данных через `npm run build-all-data` - использует локальный SQLite

**Актуальные данные всегда в `data/v1/`:**
- manifest.json содержит актуальные счётчики
- Локальные данные могут быть больше и актуальнее, чем remote D1
- Пример: локально events=228, dogs=2034, results=4886; remote D1: events=225, dogs=1628, results=2966

### Когда D1 нужен

D1 используется только для автоматизации и CI/CD:

1. **GitHub Actions workflows:**
   - `.github/workflows/update-db.yml` - автоматический импорт по расписанию (каждый понедельник)
   - `.github/workflows/update-speed-records.yml` - обновление рекордов Донино (ежедневно)

2. **Синхронизация с remote:**
   - `npm run sync-to-remote` - полная синхронизация local D1 → remote D1
   - `npm run sync-from-remote` - импорт remote D1 → local D1

3. **Разработка с D1:**
   - `npm run dev:d1` - запуск с D1 вместо локальных файлов (для тестирования)

4. **Админ-панель в dev режиме:**
   - `/admin` использует D1 для редактирования событий и загрузки результатов

### Рекомендация

Для локальной разработки и ручного управления данными используйте **только `data/v1/`**. Игнорируйте remote D1 и все команды с `--remote`, пока не потребуется автоматизация через GitHub Actions.

---

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

---

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

## D1 Free tier (импорт / dev:d1)

**Лимит Cloudflare D1 (Free):** ~5M **rows read** в сутки на аккаунт.

**Снижение нагрузки при работе с D1:**
- `npm run dev` — **не использует D1** (читает `data/v1/`)
- `npm run dev:d1` / `dev:remote` — Worker + D1 (legacy)
- `backend/src/lib/edge-cache.ts` — кэш GET на Worker (актуален только для `dev:d1` / legacy prod API)

**Локальная разработка (обычная):** `npm run dev` → `data/v1/` на диске. D1: `sync-from-remote` → `export-local-data` при необходимости импорта.

### Enrich: Breed Archive (`pedigree_url`)

**D1 не нужен.** Скрипт пишет напрямую в `data/v1/dogs/by-id/` и синхронизирует `by-key/`:

```bash
npm run enrich-breedarchive-urls
npm run build-all-data
git commit   # dogs/ + indexes/dog-profiles/
```

Подробно: [`03-DATA.md`](03-DATA.md) → «Breed Archive и pedigree_url». Changelog: [`19-CHANGELOG.md`](19-CHANGELOG.md) (2026-07-11).

**Файлы:** `backend/lib/breedarchive.ts`, `backend/scripts/enrich/enrich-breedarchive-urls.ts`.

**Файловый бэкап:** `npm run export-archive` — см. [`03-DATA.md`](03-DATA.md), [`archive/02-MIGRATION-TO-STATIC-DATA.md`](archive/02-MIGRATION-TO-STATIC-DATA.md).

**Таблица `judges`:** на remote **отсутствует**; статистика судей агрегируется из `events.judges` и `results.raw_scores`. Отдельная materialized-таблица — в планах (`FUTURE-PLANS.md`).

---

## Календарь и обновление D1 — практическое руководство

> **Дата:** 2026-07-03  
> **Контекст:** исправление календаря 2025 (и сохранение корректности 2026) + перепарсинг результатов.  
> **Связанные файлы:** `14-PARSING-RULES.md` (детали HTML), `04-DEVELOPMENT.md` (скрипты).

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

Подробнее: `14-PARSING-RULES.md` → «Парсинг календаря событий».

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

---

## См. также

- [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) — Схема таблиц и views
- [03-DATA.md](03-DATA.md) — Runtime данные в `data/v1/`
- [14-PARSING-RULES.md](14-PARSING-RULES.md) — Правила парсинга procoursing.ru
- [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) — Детали парсеров
