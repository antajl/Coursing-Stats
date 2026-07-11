# Architecture — Архитектура проекта

> **ИИ:** порядок чтения — [README.md](README.md) → [AI-GUIDE.md](AI-GUIDE.md) → [DATA.md](DATA.md). Данные runtime — в DATA.md.

## High-Level Architecture (2026-07)

```
Источник (procoursing.ru, Google Sheets)
        │
        ▼
   D1 (импорт) ──export-local-data──► data/v1/*.json  (git — источник правды)
        │                                    │
        │                                    ├─ build-derived-indexes → indexes/
        │                                    │
        │                                    ▼  CI: build-all-data
        │                              frontend/public/data/v1/ (generated, not in git)
        │                                    │
        ├─ npm run dev (админка)             ▼
        │   local-dev-server :8787     Cloudflare Pages CDN
        │   better-sqlite3 in-memory         │
        └─ dev:d1 (legacy, опционально)      ▼
                                    coursing-stats.ru
                                    React SPA → fetch /data/v1/*.json
                                    (frontend/src/hooks/useStaticData.ts)
                                    (без Worker)
```

> **Публичный прод не использует D1 и не деплоит Worker.** Подробно: `docs/DATA.md`.

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
| `backend/parsers/parse-results-coursing.ts` | `backend/parsers/` | Парсер курсинга (v1, reparse) |
| `backend/parsers/parse-results-bzmp.ts` | `backend/parsers/` | Парсер БЗМП (v1, reparse) |
| `backend/parsers/parse-results-racing.ts` | `backend/parsers/` | Парсер бега (v1, reparse) |
| `backend/parsers/coursing/index.ts` | `backend/parsers/` | Модульный парсер курсинга (v2, целевой) |
| `backend/parsers/bzmp/index.ts` | `backend/parsers/` | Модульный парсер БЗМП (v2) |
| `backend/parsers/racing/index.ts` | `backend/parsers/` | Модульный парсер racing (v2) |
| `backend/parsers/unique/` | `backend/parsers/` | Общие row/header parsers для v2 |
| `backend/scripts/load/load-events.ts` | `backend/scripts/load/` | Загрузка событий в D1 |
| `backend/scripts/load/load-results.ts` | `backend/scripts/load/` | Загрузка результатов в D1 (через API или SQL) |
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
- `v_top_by_score` — топ по очкам (курсинг + БЗМП)

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

Код `backend/src/worker.ts` оставлен для опционального `npm run dev:d1`; **в CI не деплоится**.

**Architecture:**
- Делегирует в `src/routes/`
- CORS с wildcard
- Админка: POST/PUT/DELETE → persist sqlite → `sync-sqlite-to-v1`

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
- `/top` — `TopDogs/index.tsx` (рейтинг: места / очки / скорость)
- `/event/:id` — `Events/EventResults/` (модуль: racing vs scoring details)
- `/dog/:id` — `DogProfile.tsx`
- `/judges`, `/judges/:judgeId` — судьи
- `/speed-records` — рекорды Донино: две колонки (Замер | Бега 350 м), `?view=table|stats`, `?groupBy=breed|sex|year`
- `/donino-dog/:name/:breed` — профиль собаки из рекордов Донино

**UI:** кастомные компоненты в `frontend/src/components/ui/` (Button, Card, Badge) — **не shadcn/ui**. Тема: светлая по умолчанию, class-based dark mode (`ThemeToggle` → `localStorage.theme`).

**Навигация для ИИ:** `04-DEVELOPMENT.md`

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
| status | TEXT | `new`, `improved`, `normal`, `old` (из цвета клички на листе; см. `speed-sheet-status.ts`) |
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
- Рекорды Донино: карточный список на всех экранах (замер + бега 350 м); мобильная адаптация в остальных разделах
- Фильтры адаптированы для touch-интерфейса
- Контент использует responsive контейнеры

## Deployment State

**GitHub:** https://github.com/antajl/Coursing-Stats

**Cloudflare Pages:** https://coursing-stats.ru (проект `coursingstats`)
- Push в `main` → GitHub Actions → `build-all-data` → `pages deploy`
- Статика: React SPA + `data/v1/*.json` + `sitemap.xml`

**Cloudflare Worker:** `coursingstatsworker` — **не деплоится в CI** с 2026-07-07. Старый URL `api.coursing-stats.ru` может ещё отвечать, публичный сайт его не вызывает.

**Cloudflare D1:** `pc-db` — только импорт/cron (runtime prod **не** читает D1)

> Актуальные runtime-счётчики — в `data/v1/manifest.json` (`https://coursing-stats.ru/data/v1/manifest.json`).
> D1 remote может отставать от `data/v1/`.

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

DNS зона `coursing-stats.ru` — в **Cloudflare** (NS с reg.ru на Cloudflare).

### Cloudflare

| Ресурс | Имя в дашборде |
|--------|----------------|
| **Pages** (фронт) | `coursingstats` |
| **Worker** (legacy, не в CI) | `coursingstatsworker` |
| **D1** | `pc-db` (binding `DB`, id в `wrangler.toml`) |

### Деплой

- **GitHub Actions:** `.github/workflows/deploy-frontend.yml`
  - `npm run build-all-data`
  - `wrangler pages deploy ... --project-name=coursingstats`
  - Worker deploy закомментирован (админка только локально)

### GitHub

| | |
|--|--|
| **Репозиторий** | https://github.com/antajl/Coursing-Stats |
| **Ветка продакшн** | `main` |

### Код — ключевые файлы

| Файл | Назначение |
|------|------------|
| `wrangler.toml` | `name = "coursingstatsworker"` |
| `package.json` | `"name": "coursing-stats"` |
| `frontend/src/lib/staticData.ts` | прод: fetch `/data/v1/` с CDN |
| `frontend/src/services/api.ts` | обёртка над staticData; dev admin → `/api` |
| `frontend/index.html` | `<title>Coursing Stats</title>` |
| `frontend/src/AppRoutes.tsx` | `/competitions`, редиректы `/procoursing` и `/event/:id`; dev: `/admin/calendar`, `/admin/event/:id` |
| `frontend/public/_headers` | CSP `frame-ancestors` для iframe на procoursing.ru |

### Маршруты фронтенда

| Путь | Страница |
|------|----------|
| `/` | Главная |
| `/competitions` | Рейтинг и судьи — раздел «Статистика» (бывш. `/procoursing`; календарь только локально) |
| `/procoursing` | → редирект на `/competitions` |
| `/event/:id` | → редирект на `/competitions?tab=ranking` (протоколы: `/admin/event/:id` в dev) |
| `/admin/calendar` | Календарь и протоколы (**только `npm run dev`**) |
| `/speed-records` | Рекорды Донино |
| `/admin` | Админка |

### Легаси (не использовать для новых ссылок)

| Было | Статус |
|------|--------|
| procoursing.antajl.ru | редирект на coursing-stats.ru (настроить в Cloudflare) |
| procoursing-stats Worker | переименован в coursingstatsworker |
| antajl/ProCoursing | переименован в Coursing-Stats |
| ProCoursing Stats | Coursing Stats |

### User-Agent скрапера

`CoursingStatsBot/0.1` — в `backend/lib/fetch-win1251.ts`

---

## Структура репозитория

Карта папок проекта: что где лежит и зачем.  
**Runtime сайта** — только `data/v1/` (см. [DATA.md](DATA.md)). Остальное — код, вспомогательные данные, черновики.

### Корень репозитория

| Папка / файл | Назначение | В git |
|--------------|------------|-------|
| `backend/` | API (локальный dev), парсеры procoursing.ru, npm-скрипты данных | да |
| `frontend/` | React SPA (Vite), публичный UI | да |
| `data/` | Все JSON/SQL/HTML артефакты данных | частично (см. ниже) |
| `docs/` | Документация для людей и ИИ | да |
| `scripts/` | Windows `.bat`: запуск dev, push на GitHub | да |
| `e2e/` | Playwright end-to-end тесты | да |
| `.cursor/` | Правила и skills для Cursor (`rules/`, `skills/`) | да |
| `.github/workflows/` | CI: тесты, `build-all-data`, деплой Pages | да |
| `.wrangler/` | Локальный кэш Wrangler (D1 dev) | нет |
| `node_modules/` | Зависимости npm | нет |
| `playwright-report/`, `test-results/` | Отчёты тестов | нет |

### `backend/` — сервер, парсеры, скрипты

| Путь | Назначение |
|------|------------|
| `src/local-dev-server.ts` | Dev API `:8787` — админка, чтение/запись `data/v1/` |
| `src/worker.ts` | Legacy Cloudflare Worker (`npm run dev:d1`), **не деплоится в CI** |
| `src/routes/` | Hono-роуты: `events.ts` → `/api/competitions`, admin, top, judges |
| `src/lib/` | Общая логика API (рейтинги, судьи, кэш) |
| `lib/fetch-win1251.ts` | Загрузка procoursing.ru с декодированием windows-1251 |
| `lib/fetch-archive-win1251.ts` | То же из web.archive.org (сырой снимок `id_/`) |
| `lib/local-data/` | Загрузка `data/v1/*.json` в sqlite для админки |
| `lib/event-identity.ts` | Ключ дедупликации событий календаря |
| `lib/rank-discipline-mapping.ts` | Маппинг и нормализация rank_code, discipline_code, event titles |
| `lib/dog-lookup.ts` | Поиск собак по имени и породе |
| `parsers/coursing/`, `bzmp/`, `racing/` | Модульные парсеры результатов (v2, целевые) |
| `parsers/calendar/` | Парсер страниц `s_{YEAR}.html` календаря |
| `parsers/shared/`, `unique/` | Общие куски парсеров |
| `tests/` | Vitest; `fixtures/` — эталонный HTML для парсеров |
| `schema.sql` | Схема D1 (импорт, не runtime прод) |
| `migrations/` | SQL миграции для D1 |

#### `backend/scripts/` — группы скриптов

| Папка | Назначение | Примеры |
|-------|------------|---------|
| `archive/` | Скрап календаря с procoursing и web.archive | `scrape-year-index.ts`, `backfill-*.ts` |
| `web-archive/` | Парсинг календарей и результатов из web.archive | `parse-calendar-*.ts`, `add-missing-*.ts` |
| `load/` | Загрузка в D1 (SQL / API) | `load-events.ts`, `load-results.ts` |
| `export/` | D1 → файлы | `export-local-data-v1.ts`, `export-data-archive.ts` |
| `import/` | Внешние источники → файлы | `download-archive-results.ts` |
| `reparse/` | Перепарсинг протоколов в D1 | `reparse-by-year.ts` |
| `migrate/` | Разовые миграции `data/v1` | `dedupe-calendar-v1.ts`, `remove-archive-extra-ids.ts` |
| `sync/` | Синхронизация sqlite ↔ v1, D1 local ↔ remote | `sync-sqlite-to-v1.ts` |
| `speed/` | Донино (Google Sheets → D1 / JSON) | `fetch-speed-records.ts` |
| `ci/` | Сборка для GitHub Actions / Pages | `package-pages-snapshot.ts` |
| `test/` | Ручные проверки парсеров и API | см. `test/README.md` |
| `update/` | Обновление данных | `update-current-year.ts` |
| корень | Оркестрация и утилиты | `build-all-data.ts`, `build-derived-indexes.ts`, `rebuild-calendar-index.ts`, `build-events-by-id-index.ts`, `fix-event-*.ts`, `free-dev-port.ts`, `generate-favicon.ts`, `build-data-snapshot.ts` |

### `frontend/` — клиент

| Путь | Назначение |
|------|------------|
| `src/lib/staticData.ts` | **Публичный сайт:** `fetch('/data/v1/...')` |
| `src/lib/` | Утилиты (breedMapping, judgeStats, qualificationTitles, recordDates, etc.) |
| `src/pages/` | Страницы: Home, Events, DogProfile, SpeedRecords, Judges, Admin, Guide, TopDogs, Competitions, NotFound |
| `src/pages/Events/EventResults/` | Компоненты страницы результатов (EventHeader, ResultCard, ResultsSection, details, utils) |
| `src/pages/SpeedRecords/stats/` | Компоненты статистики Донино (SpeedStatsView, CoursingStatsView, DoninoStatsSummary) |
| `src/components/` | UI-компоненты (toolbar, cards, badges, etc.) |
| `src/hooks/` | React hooks (useApi, useDarkMode, useGsap*, useInfiniteScroll) |
| `src/services/` | API сервисы (api.ts) |
| `src/schemas/` | TypeScript схемы для валидации |
| `src/data/` | Mock данные для dev |
| `vite.config.ts` | Dev: отдаёт `../data/v1` по `/data/v1/*` |
| `public/` | Статика (favicon, assets); `public/data/v1/` — **копия для prod**, генерируется CI |
| `tailwind.config.js` | Tailwind CSS конфигурация |
| `postcss.config.js` | PostCSS конфигурация |
| `eslint.config.js` | ESLint конфигурация |

### `WebArchiveResults/` — web.archive.org данные

| Путь | Назначение | В git |
|------|------------|-------|
| `calendars/` | HTML календари с web.archive.org (2015-2024) | да |
| `pages/{year}/` | HTML протоколы соревнований с web.archive.org (2022-2024) | да |
| `result-links.json` | Индекс ссылок на результаты | да |

Используется для парсинга исторических данных. Источник правды для парсинга, но не для runtime сайта.

### `data/` — данные

#### ★ `data/v1/` — источник правды для сайта

Подробно: [DATA.md](DATA.md), кратко: [data/v1/README.md](../data/v1/README.md).

В git. После правок competitions/dogs — `npm run build-all-data`.

#### `data/archive/` — долгоживущий архив

Подробно: [DATA-ARCHIVE.md](DATA-ARCHIVE.md), [data/archive/README.md](../data/archive/README.md).

| Путь | Назначение | В git |
|------|------------|-------|
| `snapshots/` | Снимки D1 (`npm run export-archive`): SQL + JSON по таблицам | нет |
| `results/` | HTML протоколов соревнований с web.archive.org (2023–2024) | нет* |
| `results/manifest.json` | Индекс: URL, `event_id`, статус скачивания | нет* |
| `_schema/v1/` | Черновик **будущей** файловой схемы (не текущий v1) | да |

\*Папку можно коммитить по желанию; по умолчанию не отслеживается — пересобирается `npm run download-archive-results`.

**Workflow архивных результатов:**
1. `npm run download-archive-results` → `data/archive/results/{year}/*.html`
2. (позже) парсинг → `data/v1/competitions/`

#### `data/tmp/` — временные рабочие файлы

| Путь | Назначение | В git |
|------|------------|-------|
| `tmp/archive/s_{YEAR}.html` | Снимки календаря procoursing с web.archive.org (для сверки, дедупа) | нет |

Не источник правды. Можно удалить и скачать заново скриптами сравнения календаря.

#### `data/backup/` — отчёты разовых операций

| Путь | Назначение | В git |
|------|------------|-------|
| `{дата}-calendar-dedupe/` | Отчёт `dedupe-calendar-v1` (что удалено, id remap) | нет |
| `{дата}-archive-extra-ids/` | Отчёт удаления лишних id календаря | нет |
| `{дата}-archive-results-import/` | (будущее) отчёт импорта протоколов | нет |

Только JSON-отчёты для аудита. В git остаётся только `data/backup/README.md`.

#### `data/backups/` — ручные бэкапы D1

SQL-дампы `wrangler d1 export` перед опасными операциями. См. [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md). **Не в git.**

#### `data/imports/` — пакетная загрузка в D1

| Файл | Назначение |
|------|------------|
| `load-events.sql` | INSERT событий из скрапа |
| `load-results.sql` | INSERT результатов |
| `speed-records.sql`, `coursing-records.sql` | Донино |

Генерируются скриптами `load/`; применяются через `wrangler d1 execute`.

#### `data/migrations/` — миграции схемы D1

Исторические `ALTER TABLE`, индексы, нормализация. Применяются вручную на local/remote D1. Не связаны с `data/v1/` напрямую.

#### Устаревшие / генерируемые пути (не использовать как v1)

| Путь | Статус |
|------|--------|
| `data/events/` | Промежуточный JSON скрапа календаря → D1. В `.gitignore` |
| `data/competitions/` | Старый экспорт (до `data/v1/competitions/`). В `.gitignore` |
| `data/exports/` | SQL для sync local→remote. В `.gitignore` |
| `data/updates/` | Пакеты SQL reparse. В `.gitignore` |
| `data/temp/` | В `.gitignore` |

### `docs/`

| Путь | Назначение |
|------|------------|
| `README.md` | Оглавление |
| `AI-GUIDE.md` | Инструкция для ИИ-агентов |
| `DATA.md` | Канон по `data/v1/` |
| `_archive/` | Старые планы — **не источник правды** |

### Быстрая схема потоков данных

```
procoursing.ru / web.archive.org
        │
        ├─ parsers + scripts ──► D1 (импорт)
        │                              │
        │                              ▼ export-local-data
        ├─ download-archive-results ──► data/archive/results/
        │                              │
        └──────────────────────────────┼──► data/v1/  ◄── git, CDN
                                       │         │
                                       │         ├─ build-derived-indexes → indexes/
                                       │         └─ package-pages-snapshot → frontend/public/
                                       ▼
                              data/backup/ (отчёты)
                              data/archive/snapshots/ (D1 dump)
```
