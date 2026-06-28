# Architecture — Архитектура проекта

## High-Level Architecture

```
Источник данных (procoursing.ru)
   │  Скрапер/парсер (Node.js)
   ▼
Cloudflare D1 (events, dogs, results)
   │
   ▼
Cloudflare Worker API
   │
   ▼
Cloudflare Pages (фронтенд: React)

Google Sheets (рекорды Донино)
   │  Скрипт загрузки (GitHub Actions)
   ▼
Cloudflare D1 (speed_records)
   │
   ▼
Cloudflare Worker API
   │
   ▼
Cloudflare Pages (фронтенд: React)
```

## Components

### 1. Scraper (Node.js)

| Script | Path | Purpose |
|--------|------|---------|
| `backend/scripts/scrape-year-index.mjs` | `backend/scripts/` | Парсит `s_{YEAR}.html`, получает список событий |
| `backend/lib/fetch-win1251.mjs` | `backend/lib/` | Загрузка страниц с декодированием windows-1251 |
| `backend/parsers/parse-results-coursing.mjs` | `backend/parsers/` | Парсер результатов курсинга |
| `backend/parsers/parse-results-bzmp.mjs` | `backend/parsers/` | Парсер БЗМП |
| `backend/parsers/parse-results-racing.mjs` | `backend/parsers/` | Парсер бега с извлечением данных о скорости |
| `backend/scripts/load-events.mjs` | `backend/scripts/load/` | Загрузка событий в D1 |
| `backend/scripts/load-results.mjs` | `backend/scripts/load/` | Загрузка результатов в D1 (через API или SQL) |
| `backend/scripts/fetch-speed-records.mjs` | `backend/scripts/` | Загрузка рекордов Донино из Google Sheets |

### 2. Database (D1)

**Tables:**
- `events` — мероприятия (event_type: coursing, bzmp, racing)
- `dogs` — собаки
- `results` — результаты выступлений (raw_scores_json хранит детальные данные)
- `speed_records` — рекорды скорости Донино (из Google Sheets)

**Views (для топов):**
- `v_top_by_placement` — медальный зачёт (курсинг + БЗМП)
- `v_top_by_score` — топ по очкам (курсинг + БЗМП)

### 3. Worker (API)

```javascript
GET /api/top/placement?breed=&year=&minStarts=
GET /api/top/score?breed=&year=&minStarts=
GET /api/top/speed?breed=&year=&minStarts=
GET /api/dogs/:id
GET /api/breeds
GET /api/years
GET /api/events?year=
GET /api/speed-records?breed=&sex=&limit=&offset=
```

**Dog Profile API Response Structure:**
```json
{
  "dog_id": 1,
  "name_lat": "Dog Name",
  "name_ru": "Кличка",
  "breed": "Saluki",
  "sex": "M",
  "owner": "Owner Name",
  "coursing_stats": {
    "total_starts": 10,
    "best_score": 95.5,
    "avg_score": 82.3,
    "gold": 5,
    "silver": 3,
    "bronze": 2
  },
  "racing_stats": {
    "total_starts": 5,
    "best_speed": "59.23",
    "avg_speed": "55.12"
  }
}
```

### 4. Frontend (Pages + React)

**Directory:** `frontend/src/`

**Pages:**
- `/` — главная страница с навигацией
- `/top/placement` — топ по местам (медальный зачёт)
- `/top/score` — топ по очкам
- `/events` — календарь событий

**Components:**
- `frontend/src/components/DogTooltip.jsx` — tooltip с раздельной статистикой курсинга и бегов (сайд-бай-сайд layout)
- `frontend/src/components/DogStatsTable.jsx` — таблица статистики собак с сортировкой
- `frontend/src/App.jsx` — главный компонент с навигацией и кнопкой обновления

**Services:**
- `frontend/src/services/api.js` — API сервис для общения с backend

## Database Schema

### events

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| year | INTEGER | Год события |
| date_start | TEXT | Дата начала (ISO 'YYYY-MM-DD') |
| date_end | TEXT | Дата окончания (для многодневных) |
| rank_label | TEXT | Ранг ('ЧРКФ', 'CACL', 'РКФ' и т.п.) |
| event_type | TEXT | 'coursing' \| 'bzmp' \| 'racing' |
| title | TEXT | Название состязания |
| host_club | TEXT | Принимающая организация |
| region | TEXT | Регион |
| location | TEXT | Место проведения |
| catalog_url | TEXT | Ссылка на каталог PDF |
| results_url | TEXT UNIQUE | Ссылка на результаты (естественный ключ) |
| confirmed | INTEGER | Флаг подтверждения ('+') |
| scraped_at | TEXT | Время скрапинга |

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
| qualification | TEXT | 'CACL, RegCACL' и т.п. |
| status | TEXT | 'finished' \| 'disqualified' \| 'withdrawn' \| 'dns' |
| raw_scores_json | TEXT | JSON с детальными данными (баллы или скорость) |
| raw_text | TEXT | Исходная строка для отладки |

**UNIQUE:** `(event_id, dog_id, breed_class)`

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

**raw_scores_json структура:**

Для Coursing/БЗМП:
```json
{
  "heats": [
    {
      "heat_number": 1,
      "bib_number": 30,
      "bib_color": "red",
      "judges": [
        {
          "judge_number": 1,
          "scores": [15, 16, 16, 15, 15],
          "sum": 77
        }
      ],
      "total": 156
    }
  ],
  "grand_total": 318
}
```

Для Racing:
```json
{
  "heat1": {
    "num": 1,
    "bib": "red",
    "time": 21.88,
    "speed": 16.45
  },
  "heat2": { ... },
  "heat3": { ... },
  "distance": 480
}
```
Скорость в м/с, конвертируется в км/ч в API (×3.6).

## Tools and Libraries

### Dependencies
- **cheerio** — Парсинг HTML (jQuery-like API)
- **iconv-lite** — Декодирование windows-1251 → UTF-8

### Built-in Node.js modules
- `fs` / `fs/promises` — работа с файлами
- `path` — работа с путями файлов

### Frontend stack
- React + Vite
- TailwindCSS
- shadcn/ui
- Lucide (иконки)
- xlsx (Excel export)
- html-to-image (скриншоты карточек)

## Deployment State

**GitHub:** https://github.com/antajl/ProCoursing

**Cloudflare Pages:** https://procoursing.pages.dev
- Автоматический деплой через GitHub Actions при push в main

**Cloudflare Worker:** https://procoursing-stats.antajltube.workers.dev
- Активен, cron: понедельник 02:00 UTC

**Cloudflare D1:** `pc-db` (~21 MB)
- events: 219
- dogs: ~1579
- results: 4639 (2023–2026)
- speed_records: данные из Google Sheets (автообновление)
