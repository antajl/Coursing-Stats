# Architecture — Архитектура проекта

> **ИИ:** порядок чтения — [README.md](README.md) → [00-AI-GUIDE.md](00-AI-GUIDE.md) → [03-DATA.md](03-DATA.md). Данные runtime — в [03-DATA.md](03-DATA.md).

## High-Level Architecture (2026-07)

```
Источник (procoursing.ru, Google Sheets)
        │
        ▼
   D1 (импорт) ──► data/v1/*.json  (git — источник правды)
        │                                    │
        │                                    ├─ build-derived-indexes → indexes/
        │                                    │
        │                                    ▼  CI: build-all-data
        │                              frontend/public/data/v1/ (generated, not in git)
        │                                    │
        ├─ npm run dev (админка)             ▼
        │   local-dev-server :8787     Cloudflare Pages CDN
        │   better-sqlite3 in-memory         │
        └────────────────────────────────────┘
                                    coursing-stats.ru
                                    React SPA → fetch /data/v1/*.json
                                    (frontend/src/hooks/useStaticData.ts)
                                    (без Worker, без D1 runtime)
```

> **Публичный прод не использует D1 и не деплоит Worker.** Подробно: [`03-DATA.md`](03-DATA.md).

### Legacy diagram (импорт)

```
Источник данных (procoursing.ru)
   │  Скрапер/парсер (Node.js)
   ▼
Cloudflare D1 (events, dogs, results)  ← скрипты импорта
```

## Components

### 1. Scraper (Node.js)

| Script | Path | Purpose |
|--------|------|---------|
| `backend/scripts/scrape/scrape-year-index.ts` | `backend/scripts/` | Парсит `s_{YEAR}.html`, получает список событий |
| `backend/lib/fetch-win1251.ts` | `backend/lib/` | Загрузка страниц с декодированием windows-1251 |
| `backend/parsers/coursing/index.ts` | `backend/parsers/` | Парсер курсинга |
| `backend/parsers/bzmp/index.ts` | `backend/parsers/` | Парсер БЗМП |
| `backend/parsers/racing/index.ts` | `backend/parsers/` | Парсер бега |
| `backend/parsers/unique/` | `backend/parsers/` | Экспериментальный парсер |
| `backend/scripts/load/load-events.ts` | `backend/scripts/load/` | Загрузка событий |
| `backend/scripts/load/load-results.ts` | `backend/scripts/load/` | Загрузка результатов |
| `backend/scripts/speed/parse-speed-xlsx.ts` | `backend/scripts/speed/` | Общий парсер XLSX замеров (координаты ячеек, цвета клички) |
| `backend/scripts/speed/sync-speed-records.ts` | `backend/scripts/speed/` | Загрузка замеров скорости Донино (prod + GitHub Actions) |
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
- `v_top_by_score` — агрегаты по очкам; CDN-индекс дополняет `rating_score` (индекс CS)

### 3. Публичный runtime (статика на Pages)

**Клиент:** `frontend/src/hooks/useStaticData.ts` — все публичные страницы читают JSON с `/data/v1/` (CDN).

**Precomputed indexes** (`backend/scripts/build-derived-indexes.ts` → `data/v1/indexes/`):
- топы (`top-placement-*`, `top-score-*`, `top-speed-*`)
- судьи (`judges-summary.json`, `judge-details/`, `judges-raw-rows.json`)
- профили собак (`dog-profiles/{id}.json`)
- `years.json`, `events-by-id.json`, `sitemap.xml`

**Build process:**
- `frontend/scripts/copy-data.js` — копирует `data/v1/` в `frontend/public/data/v1/` перед билдом
- `frontend/package.json` — `"build": "node scripts/copy-data.js && vite build"`
- Cloudflare Pages включает `public/data/v1/` в деплой
- **Важно:** `frontend/public/data/v1/` не в git (в .gitignore), генерируется автоматически при билде

Клиентская фильтрация/сортировка: `frontend/src/lib/breedMapping.ts`, `judgeStats.ts`.

### 4. Local Dev API (Hono, только локально)

**Entry point:** `backend/src/local-dev-server.ts` → `backend/src/app.ts`

**Architecture:**
- Делегирует в `src/routes/`
- CORS с wildcard
- Админка: POST/PUT/DELETE → persist sqlite → `sync-sqlite-to-v1`
- Все API routes читают из JSON файлов в `data/v1/` через `static-api.ts`

**Routes (локальный dev API / legacy Worker — не публичный прод):**
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

### 5. Frontend (Pages + React)

**Directory:** `frontend/src/`

**Shell:** `App.tsx` (layout + `Nav`) → `AppRoutes.tsx` (lazy routes, code-split chunks)

**Pages (lazy-loaded):**
- `/` — `Home.tsx` (лендинг: hero, топ сезона, рекорды Донино)
- `/competitions` — `Competitions.tsx` (hub: Календарь, Рейтинг, Судьи)
- `/top` — `TopDogs/index.tsx` (рейтинг: **очки** default | места; рейсинг отдельная колонка)
- `/event/:id` — `Events/EventResults/` (модуль: racing vs scoring details)
- `/dog/:id` — `DogProfile.tsx`
- `/judges`, `/judges/:judgeId` — судьи
- `/speed-records` — рекорды Донино: две колонки (Замер | Бега 350 м), `?view=table|stats`, `?groupBy=breed|sex|year`
- `/donino-dog/:name/:breed` — профиль собаки из рекордов Донино

**UI:** кастомные компоненты в `frontend/src/components/ui/` (Button, Card, Badge) — **не shadcn/ui**. Тема: светлая по умолчанию, class-based dark mode (`ThemeToggle` → `localStorage.theme`).

**Навигация для ИИ:** [`04-FRONTEND.md`](04-FRONTEND.md)

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
- `frontend/src/lib/staticData.ts` — публичный прод: fetch `/data/v1/` с CDN
- `frontend/src/services/api.ts` — обёртка над staticData; mock fallback в dev

## Database Schema

Полные таблицы (`events`, `dogs`, `results`, `speed_records`, `coursing_records`) и структура `raw_scores_json` — **[`12-DATABASE-SCHEMA.md`](12-DATABASE-SCHEMA.md)** (LEGACY, только для импорта/парсинга).

Кратко для runtime-мышления:
- Runtime сайта — **`data/v1/`**, не D1
- `speed_records` (км/ч) ≠ `coursing_records` (350 м, сек) — см. [`09-SPEED-RECORDS.md`](09-SPEED-RECORDS.md)
- Views топов: `v_top_by_placement`, `v_top_by_score` (+ `rating_score` / индекс CS в CDN)

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
- Рекорды Донино: карточный список на всех экранах (замер + бега 350 м); мобильная адаптация в остальных разделах
- Фильтры адаптированы для touch-интерфейса
- Контент использует responsive контейнеры

## Deployment State

Кратко: Pages `coursingstats` ← push `main` → CI `build-all-data` → deploy. Worker **не** в CI. D1 — только импорт.

**Полный runbook:** [`20-OPERATIONS.md`](20-OPERATIONS.md). Кэш/SPA: [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md).

Актуальные счётчики: `data/v1/manifest.json`.

---

## Бренд и инфраструктура

Единый справочник имён, доменов и сервисов. Обновлять при смене хостинга или ребрендинга.

### Бренд

| | |
|--|--|
| **Название в UI** | Coursing Stats |
| **Коротко / код** | `coursing-stats` |
| **Источник данных** | [procoursing.ru](http://procoursing.ru) — внешний сайт, **не переименовывать** в парсерах и БД |

### Домены (продакшн)

| Роль | URL |
|------|-----|
| **Сайт** | https://coursing-stats.ru |
| **Сайт (www)** | https://www.coursing-stats.ru |
| **Данные (CDN)** | https://coursing-stats.ru/data/v1/ |
| **API (legacy, не используется сайтом)** | https://api.coursing-stats.ru |

DNS зона `coursing-stats.ru` — в **Cloudflare**.

### Cloudflare

| Ресурс | Имя |
|--------|-----|
| **Pages** | `coursingstats` |
| **Worker** (legacy) | `coursingstatsworker` |
| **D1** | `pc-db` |

### Деплой

См. [`20-OPERATIONS.md`](20-OPERATIONS.md). Workflow: `.github/workflows/deploy-frontend.yml`.

### GitHub

| | |
|--|--|
| **Репозиторий** | https://github.com/antajl/Coursing-Stats |
| **Ветка продакшн** | `main` |

### Код — ключевые файлы

| Файл | Назначение |
|------|------------|
| `wrangler.toml` | Worker/D1 config (legacy runtime) |
| `frontend/src/lib/staticData.ts` | Публичный fetch `/data/v1/` |
| `backend/scripts/build-all-data.ts` | Indexes + package для Pages |

Карта маршрутов UI: [`04-FRONTEND.md`](04-FRONTEND.md).

### Легаси (не использовать для новых ссылок)

- `api.coursing-stats.ru` — Worker не деплоится
- Публичный календарь / `/event/:id` на проде — вариант A; админка только локально

### User-Agent скрапера

См. парсеры / `fetch-win1251.ts`.

---

## Структура репозитория

Карта папок (high-level). **Runtime сайта** — только `data/v1/` ([03-DATA.md](03-DATA.md)).

| Путь | Назначение |
|------|------------|
| `backend/` | Dev API, парсеры, scripts (`build-all-data`, speed, load, …) |
| `frontend/` | React SPA; `lib/staticData.ts` → `/data/v1/` |
| `data/v1/` | ★ источник правды (git → CDN) |
| `data/archive/` | Снимки D1, HTML протоколов (не runtime) |
| `docs/` | Документация ([README.md](README.md)) |
| `scripts/` | `.bat`: start-servers, deploy-to-github, update-donino |
| `e2e/` | Playwright |
| `.cursor/` / `.devin/` | Rules + skills |
| `.github/workflows/` | CI Pages, update-speed-records |

Детали скриптов: [`04-DEVELOPMENT.md`](04-DEVELOPMENT.md). Дерево `data/`: [`03-DATA.md`](03-DATA.md).

### Быстрая схема потоков данных

```
procoursing.ru / Sheets / web.archive
        │
        ├─ parsers + scripts ──► (D1 импорт, опционально)
        │                              │
        └──────────────────────────────▼
                                 data/v1/  ◄── git
                                       │
                                       ├─ build-derived-indexes → indexes/
                                       └─ CI build-all-data → Pages CDN
```

См. также: [`03-DATA.md`](03-DATA.md), [`20-OPERATIONS.md`](20-OPERATIONS.md), [`12-DATABASE-SCHEMA.md`](12-DATABASE-SCHEMA.md) (legacy).
