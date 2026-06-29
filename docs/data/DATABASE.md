# Database — Работа с БД

Документация по базе данных Cloudflare D1 (SQLite).

## Загрузка результатов

### Через API (рекомендуется для будущих разработок)

Для загрузки результатов используется API эндпоинт `/api/admin/import-results`:

```bash
node backend/scripts/load/load-results.mjs data/events/events.json http://127.0.0.1:8787/api/admin/import-results ADMIN_TOKEN
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
| status | TEXT | 'new', 'improved' или null |
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
- Скрипт: `backend/scripts/migrate/migrate-normalize-dog-names.mjs`

**Нормализация total_score:**
- Скрипт: `backend/scripts/archive/migrate-normalize-existing-scores.mjs`

---

## Data Import/Export

### Загрузка событий

```bash
npm run load-events
```

Скрипт: `backend/scripts/load-events.mjs`

### Загрузка результатов

```bash
npm run load-results
```

Скрипт: `backend/scripts/load-results.mjs`

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

Скрипт: `backend/scripts/sync-local-to-remote.mjs`

**Параметры:**
- `--push` — push local → remote
- `--pull` — pull remote → local

---

## Текущее состояние БД

**Local и remote синхронизированы 2026-06-28:**

- **events:** 219
- **dogs:** ~1579
- **results:** 4639
- **speed_records:** данные из Google Sheets (автообновление)
- **Remote D1:** ~21 MB

**Распределение по годам:**
- 2023: 771 результатов (22 события)
- 2024: 1086 результатов (27 событий)
- 2025: 1971 результатов (50 событий)
- 2026: 811 результатов (16 событий)
- 2015-2022: НЕДОСТУПНЫ (хранятся как изображения, требуется OCR)

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
- Скрипт синхронизации: `backend/scripts/sync-local-to-remote.mjs`
- Скрипт загрузки событий: `backend/scripts/load-events.mjs`
- Скрипт загрузки результатов: `backend/scripts/load-results.mjs`
