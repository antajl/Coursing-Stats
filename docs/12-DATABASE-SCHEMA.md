# Database Schema — Схема (legacy D1 / локальная SQLite)

> **LEGACY — читать только для задач D1 / импорта / парсинга.**  
> Публичный runtime: [`03-DATA.md`](03-DATA.md) → `data/v1/`. Workflow импорта: [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md).

Полная схема (исторически Cloudflare D1, локально better-sqlite3). Файл схемы: `backend/schema.sql`.

---

## Tables

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

---

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
| pedigree_url | TEXT | Ссылка на карточку на [breedarchive.com](https://breedarchive.com) (enrich: `npm run enrich-breedarchive-urls`) |
| merged_into_dog_id | INTEGER FK | Для ручной склейки дублей |
| created_at | TEXT | Время создания |

**UNIQUE:** `(name_lat, breed)`

**Indexes:**
- `idx_dogs_breed` на `breed`

---

### judges

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| name | TEXT UNIQUE | Имя судьи |
| created_at | TEXT | Время создания |

**Indexes:**
- `idx_judges_name` на `name`

---

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

---

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
| status | TEXT | `new`, `improved`, `normal`, `old` (цвет клички на листе) |
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

**Скорость для UI:** `1260 / time_seconds` км/ч.

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

---

### v_top_by_score

Базовые агрегаты по очкам (курсинг + БЗМП). В CDN-индексах `top-score-*.json` дополнительно считаются `avg_judge_score`, `judge_eval_count`, **`rating_score`** (индекс CS) — см. `attachScoreMetrics` в `build-derived-indexes.ts`.

```sql
SELECT
  d.id AS dog_id,
  ...
  MAX(r.total_score) AS best_score,
  COUNT(*) AS total_starts,
  MAX(...) AS best_judge_score,
  ...
```

**Сортировка на сайте:** `rating_score DESC`, не `best_score`. `total_score` = `grand_total` без деления на судей.

---

## Raw Scores JSON Structure

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

---

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

## Current State (2026-07-09)

### Runtime (`data/v1/`) — источник для сайта

| Сущность | Количество |
|----------|------------|
| events (календарь) | 228 |
| competitions с results | 92 |
| dogs | 2034 |
| results | 4886 |
| donino_speed | 191 |
| donino_coursing | 107 |
| breeds | 86 |

Файл: `data/v1/manifest.json`

### Remote D1 (`pc-db`) — импорт, может отличаться

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

---

## См. также

- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Импорт, синхронизация, миграции
- [03-DATA.md](03-DATA.md) — Runtime данные в `data/v1/`
- [14-PARSING-RULES.md](14-PARSING-RULES.md) — Правила парсинга procoursing.ru
- [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) — Детали парсеров
