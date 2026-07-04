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

Google Sheets (рекорды Донино — два листа)
   │  Скрипты загрузки (GitHub Actions / вручную)
   ▼
Cloudflare D1 (speed_records + coursing_records)
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
| `backend/scripts/scrape/scrape-year-index.ts` | `backend/scripts/` | Парсит `s_{YEAR}.html`, получает список событий |
| `backend/lib/fetch-win1251.ts` | `backend/lib/` | Загрузка страниц с декодированием windows-1251 |
| `backend/parsers/parse-results-coursing.ts` | `backend/parsers/` | Парсер курсинга (v1, reparse) |
| `backend/parsers/parse-results-bzmp.ts` | `backend/parsers/` | Парсер БЗМП (v1, reparse) |
| `backend/parsers/parse-results-racing.ts` | `backend/parsers/` | Парсер бега (v1, reparse) |
| `backend/parsers/coursing/index.ts` | `backend/parsers/` | Модульный парсер курсинга (v2, целевой) |
| `backend/parsers/bzmp/index.ts` | `backend/parsers/` | Модульный парсер БЗМП (v2) |
| `backend/parsers/racing/index.ts` | `backend/parsers/` | Модульный парсер racing (v2) |
| `backend/parsers/unique/` | `backend/parsers/` | Общие row/header parsers для v2 |
| `backend/scripts/load/load-events.ts` | `backend/scripts/load/` | Загрузка событий в D1 |
| `backend/scripts/load/load-results.ts` | `backend/scripts/load/` | Загрузка результатов в D1 (через API или SQL) |
| `backend/scripts/speed/sync-speed-records.ts` | `backend/scripts/speed/` | Загрузка замеров скорости Донино |
| `backend/scripts/speed/fetch-coursing-records.ts` | `backend/scripts/speed/` | Загрузка зачётов курсинга 350 м |

### 2. Database (D1)

**Tables:**
- `events` — мероприятия (event_type: coursing, bzmp, racing)
- `dogs` — собаки
- `results` — результаты выступлений (raw_scores_json хранит детальные данные)
- `speed_records` — замер скорости Донино (км/ч, Google Sheet `1NTiY3HXZ…`)
- `coursing_records` — бега борзых 350 м (время в сек, Google Sheet `1hpdA8vl…`)

**Views (для топов):**
- `v_top_by_placement` — медальный зачёт (курсинг + БЗМП)
- `v_top_by_score` — топ по очкам (курсинг + БЗМП)

### 3. Worker (API)

**Entry point:** `backend/src/worker.ts` (тонкая обёртка) → `backend/src/app.ts` (Hono application)

**Architecture:**
- Тонкий диспетчер, делегирует в `src/routes/`
- CORS с wildcard для всех запросов
- Логирование всех запросов
- Обработка OPTIONS для CORS preflight

**Routes:**
```javascript
GET /api/top/placement?breed=&year=&minStarts=
GET /api/top/score?breed=&year=&minStarts=
GET /api/top/speed?breed=&year=&minStarts=
GET /api/dogs/:id
GET /api/breeds
GET /api/years
GET /api/competitions?year=
GET /api/competitions/:id
GET /api/competitions/:id/results
GET /api/dogs/:id/competitions
GET /api/speed-records?breed=&sex=&limit=&offset=
GET /api/coursing-records?breed=&limit=&search=&year=
GET /api/judges?breed=&discipline=
GET /api/judges/:id/details
POST /api/admin/import-results
POST /api/admin/delete-results/:eventId
POST /api/admin/reparse-coursing
POST /api/admin/recreate-views
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

**Shell:** `App.tsx` (layout + `Nav`) → `AppRoutes.tsx` (lazy routes, code-split chunks)

**Pages (lazy-loaded):**
- `/` — `Home.tsx` (лендинг, WIP)
- `/procoursing` — `Procoursing.tsx` (hub: Календарь, Рейтинг, Судьи)
- `/top` — `TopDogs/index.tsx` (рейтинг: места / очки / скорость)
- `/event/:id` — `Events/EventResults/` (модуль: racing vs scoring details)
- `/dog/:id` — `DogProfile.tsx`
- `/judges`, `/judges/:judgeId` — судьи
- `/speed-records` — рекорды Донино (отдельный источник, не procoursing.ru)
- `/donino-dog/:name/:breed` — профиль собаки из рекордов Донино

**UI:** кастомные компоненты в `frontend/src/components/ui/` (Button, Card, Badge) — **не shadcn/ui**. Тема: светлая по умолчанию, class-based dark mode (`ThemeToggle` → `localStorage.theme`).

**Навигация для ИИ:** `docs/development/FRONTEND-MAP.md`

**Components:**
- `frontend/src/components/Nav.tsx` — шапка `.nav-glass`, мобильное меню
- `frontend/src/components/ThemeToggle.tsx` — переключатель темы
- `frontend/src/components/DogTooltip.tsx` — tooltip со статистикой
- `frontend/src/components/DogStatsTable.tsx` — таблица рейтинга (медали в заголовках)
- `frontend/src/components/FilterSelect.tsx` — фильтры (`allLabel`, `ariaLabel`)
- `frontend/src/components/FiltersDropdown.tsx` — расширенные фильтры

**Lib:**
- `frontend/src/lib/recordDates.ts` — даты рекордов Донино; статистика 350 м (`coursingTimesToStats`, `time350ToSpeedKmh`)

**Services:**
- `frontend/src/services/api.ts` — API client

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

### coursing_records

Зачёты **бегов борзых 350 м** (отдельный Google Sheet, не путать с `speed_records`).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| breed | TEXT | Порода |
| name | TEXT | Кличка |
| time_seconds | REAL | Время на 350 м (сек) |
| date | TEXT | Дата замера |
| track_length | INTEGER | 350 |
| history | TEXT | JSON с предыдущими результатами |
| dog_id | INTEGER FK | Связь с `dogs` (опционально) |

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
- React + Vite (`vite.config.ts`)
- TailwindCSS (адаптивный дизайн с брейкпоинтами md:)
- Кастомные UI-компоненты (`components/ui/`) — не shadcn
- Lucide (иконки)
- xlsx (Excel export)
- html-to-image (скриншоты карточек)
- React.lazy + manualChunks для code-splitting

**Мобильная адаптивность:**
- Полная адаптация всех страниц для мобильных устройств
- Таблицы заменены на карточки на мобильных
- Фильтры адаптированы для touch-интерфейса
- Контент использует responsive контейнеры

## Deployment State

**GitHub:** https://github.com/antajl/ProCoursing

**Cloudflare Pages:** https://procoursing.pages.dev
- Автоматический деплой через GitHub Actions при push в main

**Cloudflare Worker:** https://procoursing-stats.antajltube.workers.dev
- Активен, cron: понедельник 02:00 UTC

**Cloudflare D1:** `pc-db` (~21 MB)
- events: 219 (2023–2026)
- dogs: ~1579
- results: 4639
- speed_records: замер скорости из Google Sheets (~198 после дедупа)
- coursing_records: бега 350 м из отдельного Google Sheet (~95+ зачётов)
