# Development — Разработка

> **ИИ:** [README.md](README.md) → [00-AI-GUIDE.md](00-AI-GUIDE.md) → [03-DATA.md](03-DATA.md). **UI и маршруты:** [04-FRONTEND.md](04-FRONTEND.md).

Документация по разработке: backend scripts, npm, тесты, деплой.

## Содержание

- [File Structure](#file-structure)
- [Backend Scripts](#backend-scripts)
- [NPM Scripts](#npm-scripts)
- [Local Development](#local-development)
- [Testing](#testing)
- [Tools and Libraries](#tools-and-libraries)
- [Best Practices](#best-practices--лучшие-практики)
- [Deployment](#deployment--деплой-и-инфраструктура)
- [Отладка парсеров с фикстурами](#отладка-парсеров-с-фикстурами)

**Frontend map, PageToolbar, мобильная вёрстка:** [`04-FRONTEND.md`](04-FRONTEND.md)

---

## File Structure

### Backend

```
backend/
├── src/
│   ├── worker.ts              # Legacy Worker entry (dev:d1; не деплоится в CI)
│   ├── local-dev-server.ts    # Dev API :8787 (data/v1/, админка)
│   ├── app.ts                 # Hono application с роутингом
│   └── routes/                # API endpoints
│       ├── admin.ts           # Admin endpoints (import-results, delete-results, recreate-views)
│       ├── events.ts           # Events & results (renamed from competitions.ts)
│       ├── dogs.ts            # Dog profiles
│       ├── judges.ts          # Judges statistics
│       ├── speed.ts           # Speed records
│       └── top.ts             # Top ratings (placement, score, speed)
├── parsers/                   # Data parsers (coursing/bzmp/racing/…)
│   ├── coursing/index.ts
│   ├── bzmp/index.ts
│   ├── racing/index.ts
│   ├── unique/
│   ├── shared/
│   ├── calendar/scrape-year-page.ts
│   └── shows/
├── scripts/                   # All .ts, run via npx tsx
│   ├── scrape/                # Скрапинг индекса событий с procoursing.ru
│   │   └── scrape-year-index.ts
│   ├── load/                  # Загрузка данных
│   │   ├── load-events.ts
│   │   └── split-sql-batches.ts
│   ├── reparse/               # Перепарсинг данных
│   ├── migrate/               # Миграции данных
│   ├── sync/                  # Синхронизация (sync-sqlite-to-v1)
│   ├── update/                # Обновление данных
│   ├── speed/                 # Скрипты для Донино
│   ├── test/                  # Тестовые скрипты
│   │   ├── test-parser.ts, test-parsers-fixtures.ts
│   │   ├── download-fixtures.ts, smoke-api.ts
│   │   └── debug/             # One-off investigation scripts
│   ├── ci/                    # CI скрипты
│   ├── export/                # Экспорт данных
│   └── archive/               # One-time scripts (18 скриптов, DO NOT REUSE)
├── lib/
│   ├── fetch-win1251.ts
│   └── dog-lookup.ts
├── tests/
│   ├── api.test.ts            # describe.skip — use smoke-api.ts until vitest@4
│   └── fixtures/              # Real HTML: coursing/, bzmp/, racing/
```

---

## Backend Scripts

Все скрипты — `.ts`, запуск через `npx tsx`. Файлов `.mjs` в проекте нет.

### Оркестрация и утилиты (корень `backend/scripts/`)

#### `build-events-by-id-index.ts`
**Назначение:** Построение индекса `data/v1/indexes/events-by-id.json` для быстрого поиска результатов событий по ID.

**Использование:**
```bash
npx tsx backend/scripts/build-events-by-id-index.ts
```

**Что делает:**
- Сканирует все файлы календаря `data/v1/calendar/{year}.json`
- Извлекает события с результатами (`has_results: true`)
- Строит индекс вида `{ "eventId": { "results_file": "...", "date_start": "...", "title": "...", "has_results": true } }`
- Используется фронтендом для загрузки результатов через `staticData.getEventResults(eventId)`

**Когда запускать:**
- После добавления новых событий с результатами в календарь
- После изменения структуры файлов результатов
- После ручного исправления путей к файлам результатов

#### `fix-event-{eventId}.ts`
**Назначение:** Точечное исправление конкретного события без перепарсинга всех данных.

**Использование:**
```bash
npx tsx backend/scripts/fix-event-20230528.ts
```

**Что делает:**
- Читает существующий JSON файл события
- Добавляет недостающие результаты вручную (безопасно для других событий)
- Обновляет счётчик результатов
- Сохраняет файл с обновлённой датой экспорта

**Когда использовать:**
- Когда парсер пропустил часть данных в конкретном событии
- Когда нужно быстро исправить ошибку без риска повредить другие данные
- Для тестирования изменений структуры данных

#### `free-dev-port.ts`
**Назначение:** Освобождение занятых портов перед запуском dev-серверов.

**Использование:**
Автоматически запускается перед `npm run dev`.

**Что делает:**
- Проверяет и освобождает порты 5173, 5174, 8787
- Убивает процессы, занимающие эти порты
- Позволяет избежать ошибок "port already in use"

#### `generate-favicon.ts`
**Назначение:** Генерация favicon для сайта.

**Использование:**
```bash
npx tsx backend/scripts/generate-favicon.ts
```

**Что делает:**
- Генерирует favicon из исходного изображения
- Создаёт различные размеры и форматы
- Сохраняет в `frontend/public/`

#### `build-data-snapshot.ts`
**Назначение:** Создание снимка данных для быстрой загрузки.

**Использование:**
```bash
npx tsx backend/scripts/build-data-snapshot.ts
```

**Что делает:**
- Создаёт сжатый снимок данных `data/v1/`
- Используется для оптимизации загрузки в dev-режиме

### Web Archive скрипты (`backend/scripts/web-archive/`)

#### `parse-calendar-{year}.ts`
**Назначение:** Парсинг календаря конкретного года из web.archive.org.

**Использование:**
```bash
npx tsx backend/scripts/web-archive/parse-calendar-2023.ts
```

### Speed скрипты (`backend/scripts/speed/`)

#### `fetch-speed-records.ts`
**Назначение:** Загрузка рекордов скорости из Google Sheets.

**Использование:**
```bash
npx tsx backend/scripts/speed/fetch-speed-records.ts
```

**Что делает:**
- Загружает данные о скорости из Google Sheets
- Сохраняет в `data/v1/donino/speed_records.json`

#### `fetch-coursing-records.ts`
**Назначение:** Загрузка записей бега 350м из Google Sheets.

**Использование:**
```bash
npx tsx backend/scripts/speed/fetch-coursing-records.ts
```

**Что делает:**
- Загружает данные о бегах 350м
- Сохраняет в `data/v1/donino/coursing_records.json`

### CI скрипты (`backend/scripts/ci/`)

#### `package-pages-snapshot.ts`
**Назначение:** Подготовка данных для деплоя на Cloudflare Pages.

**Использование:**
Запускается автоматически в GitHub Actions.

**Что делает:**
- Копирует `data/v1/` в `frontend/public/data/v1/` рекурсивно (включая подкаталоги)
- Подготавливает данные для деплоя на Cloudflare Pages

**Важно:** Исправлено в 2026-07-09 — теперь копирует все файлы рекурсивно, включая подкаталоги (`judge-details/`, `dog-profiles/`), которые ранее пропускались.
**Важно (2026-07-11):** `frontend/public/data/v1/` не в git (в .gitignore), генерируется автоматически при билде. Единственный источник правды - `data/v1/`.

### Тестовые скрипты (`backend/scripts/test/`)

#### `test-parser.ts`
**Назначение:** Тестирование парсеров на эталонных HTML.

**Использование:**
```bash
npx tsx backend/scripts/test/test-parser.ts
```

**Что делает:**
- Загружает эталонные HTML из `backend/tests/fixtures/`
- Запускает парсер
- Сравнивает результат с ожидаемым

#### `smoke-api.ts`
**Назначение:** Быстрая проверка API.

**Использование:**
```bash
npx tsx backend/scripts/test/smoke-api.ts
```

**Что делает:**
- Делает запросы к основным эндпоинтам
- Проверяет валидность ответов
- Сообщает об ошибках

### Общие рекомендации

1. **После правок данных** всегда запускайте `npm run build-all-data`
2. **Перед деплоем** проверяйте все индексы
3. **Для точечных исправлений** используйте `fix-event-*.ts` вместо полного перепарсинга
4. **После миграций** сохраняйте отчёты для аудита
5. **Тестируйте парсеры** на эталонных данных перед применением к реальным данным

### Frontend

```
frontend/
├── src/
│   ├── App.tsx                # Shell: Nav + AppRoutes
│   ├── AppRoutes.tsx          # Lazy routes (code-split pages)
│   ├── main.tsx
│   ├── components/
│   │   ├── Nav.tsx            # Header: .nav-glass, centered links
│   │   ├── PageLoader.tsx
│   │   ├── ThemeToggle.tsx    # light default; localStorage.theme
│   │   ├── toolbar/           # PageToolbar, ToolbarSegmentControl, ToolbarFiltersDropdown, …
│   │   ├── OwnerCrownName.tsx
│   │   ├── DoninoHomeRecordRow.tsx
│   │   ├── PodiumRankMark.tsx, MedalTally.tsx, StatsStrip.tsx
│   │   ├── ui/                # Custom Button, Card, Badge (NOT shadcn)
│   │   ├── DogStatsTable.tsx
│   │   ├── FiltersDropdown.tsx
│   │   └── …
│   ├── pages/
│   │   ├── Home.tsx           # Landing: hero, podium, Donino columns
│   │   ├── Competitions.tsx    # Tab hub: Events, TopDogs, Judges
│   │   ├── TopDogs/           # index, TopDogsFilters, TopDogsColumns, CoursingRatingHint, filterUtils
│   │   ├── DogProfile.tsx
│   │   ├── DoninoDogProfile.tsx
│   │   ├── Events/
│   │   │   ├── index.tsx      # Calendar
│   │   │   └── EventResults/  # index, EventHeader, details/{Racing,Scoring}Detail
│   │   ├── Judges/
│   │   ├── SpeedRecords/      # Donino hub: две колонки, записи + статистика
│   │   ├── Shows/             # Shows pages
│   │   ├── Guide/             # Guide pages
│   │   └── NotFound.tsx
│   ├── services/api.ts
│   ├── hooks/                 # React hooks
│   │   ├── useApi.ts          # API data fetching hooks
│   │   ├── useDarkMode.ts     # Dark mode toggle
│   │   ├── useGsapFadeIn.ts   # GSAP fade-in animation
│   │   ├── useGsapRiseIn.ts   # GSAP rise-in animation
│   │   └── useInfiniteScroll.ts # Infinite scroll pagination
│   └── lib/
│       ├── staticData.ts      # Prod data loader (fetch JSON from /data/v1/ CDN)
│       ├── query-client.tsx   # React Query client
│       ├── icons.ts           # Icon components
│       ├── toolbar.ts         # Tailwind class bundles for PageToolbar
│       ├── ownerMarks.ts      # Owner crown marks (frontend-only)
│       ├── recordDates.ts     # Donino dates (Excel serial, dedupe, expandCoursingTimeline)
│       ├── breedMapping.ts    # Breed name mapping
│       ├── dogName.ts         # Dog name utilities
│       ├── judgeSortUtils.ts  # Judge sorting utilities
│       ├── judgeStats.ts      # Judge statistics calculations
│       ├── motion.ts          # Motion/animation utilities
│       ├── qualificationTitles.ts # Qualification titles constants
│       ├── season.ts          # Season utilities
│       └── statusReason.ts    # Status reason utilities
├── public/
├── package.json
├── vite.config.ts             # TypeScript; manualChunks for vendors
└── tailwind.config.js
```

### Data Directory

Кратко:
- **`data/v1/`** — runtime сайта (git)
- **`data/archive/`** — снимки D1 + HTML протоколов (`results/`)
- **`data/tmp/`** — календари web.archive для сверки
- **`data/imports/`, `data/migrations/`** — SQL для D1
- **`data/backup/`** — отчёты миграций (не в git)

### Root Directory

```
/
├── README.md
├── package.json
├── package-lock.json          # В репозитории (npm ci в CI)
├── wrangler.toml
├── scripts/                   # Shell scripts
│   └── README.md
├── assets/                    # Static assets
│   └── logo.svg (renamed from 2.svg)
├── .devin/                    # Devin / Cascade: rules, skills, workflows
└── .cursor/                   # Cursor: rules, skills
```

---

## NPM Scripts

### Root scripts

```bash
npm run dev                    # local-dev-server + Vite (data/v1/)
npm run scrape-index           # Scrape event index
npm run parse-coursing         # Parse coursing results
npm run parse-bzmp             # Parse BZMP results
npm run parse-racing           # Parse racing results
npm run load-events            # events.json → data/imports/load-events.sql
npm run load-results           # Load results to D1
npm run reparse-bzmp           # Reparse BZMP events (legacy)
npm run reparse-coursing       # Reparse coursing events (legacy)
npm run reparse-racing         # Reparse racing events (legacy)
npm run reparse-2023           # Reparse all 2023 events
npm run reparse-2024           # Reparse all 2024 events
npm run reparse-2025           # Reparse 2025 → SQL (remote D1 by default; add --local for dev)
npm run reparse-2026           # Reparse all 2026 events
npm run reparse-2026-coursing  # Reparse 2026 coursing events only
npm run reparse-2026-bzmp      # Reparse 2026 BZMP events only
npm run reparse-2026-racing    # Reparse 2026 racing events only
npm run ci-update-db           # Increment current year → remote D1
npm run migrate-dog-names      # Normalize dog names in local D1
npm run sync-from-remote         # remote D1 → local (legacy; скрипта может не быть в package.json)
npm run dev:remote               # dev с remote D1 (жрёт квоту reads!)
npm run export-archive           # полный файловый архив → data/archive/snapshots/
npm run generate-favicon         # favicon.ico из favicon.svg
npm run sync-to-remote         # Full sync local D1 → remote
npm run update-current-year    # Update current year events
npm run merge-dogs             # Merge duplicate dogs
npm run enrich-breedarchive-urls  # Заполнить pedigree_url из breedarchive.com → dogs/by-id
npm run fetch-speed-records    # Fetch speed records
npm run test-parser            # Synthetic parser tests (v1)
npm run test-parser-fixtures   # v2 modular parsers on real HTML fixtures
npm run download-fixtures      # Download fixtures from procoursing.ru
npm run smoke-api              # Manual API smoke test (needs npm run dev)
npm test                       # vitest (api.test.ts currently skipped; includes calendar-scrape.test.ts)
# Calendar fixtures: npx tsx backend/scripts/test/download-calendar-fixtures.ts
# Split large reparse SQL: npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql
# D1 workflow: см. 13-DATABASE-WORKFLOW.md — секция «Календарь и обновление D1»
```

### Frontend scripts

```bash
cd frontend
npm run dev                    # Start Vite dev server
npm run build                   # Build for production
npm run lint                   # Run ESLint
npm run preview                # Preview production build
```

---

## Local Development

### Запуск серверов

**Автоматический запуск:**
```bash
npm run dev
```

**Windows batch:**
```bash
scripts/start-servers.bat  # local only, not in git
```

**Первый запуск:**
```bash
npm run build-all-data   # при необходимости пересобрать indexes
npm run dev
```

**Вручную (рекомендуется — data/v1/):**

Терминал 1:
```bash
npx tsx backend/src/local-dev-server.ts
# http://127.0.0.1:8787
```

Терминал 2:
```bash
cd frontend && npm run dev
# http://localhost:5173
```

**Legacy (Worker + локальная D1):**
```bash
npx wrangler dev backend/src/worker.ts --port 8787
cd frontend && npm run dev
```

**Remote D1 (осторожно — квота reads):**
```bash
npm run dev:remote
```

`npm run dev` по умолчанию читает **data/v1/** с диска — D1 не нужна.

**Тема UI:** светлая по умолчанию; тёмная — через переключатель в Nav (`localStorage.theme`).

### Файловый архив

```bash
npm run export-archive
```

См. [`03-DATA.md`](03-DATA.md) и [`archive/02-MIGRATION-TO-STATIC-DATA.md`](archive/02-MIGRATION-TO-STATIC-DATA.md).

### React Query (frontend)

`frontend/src/hooks/useApi.ts` — `staleTime` на prod (меньше дублей к `/data/v1/`). События не refetch на каждый mount.

---

## Testing

Подробно: [`08-TESTING.md`](08-TESTING.md).

### Parser Testing

```bash
npm run test-parser              # synthetic HTML
npm run test-parser-fixtures     # fixtures in backend/tests/fixtures/
npm run download-fixtures        # refresh fixtures from live URLs
```

### CLI Mode

```bash
npm run parse-coursing -- <url>
npm run parse-bzmp -- <url>
npm run parse-racing -- <url>
```

### API Testing

```bash
npm test                         # vitest — api.test.ts is describe.skip
npm run smoke-api                # manual check with dev server running
```

### E2E (Playwright)

```bash
npm run test:e2e                 # поднимает npm run dev автоматически
npm run test:e2e:ui              # интерактивный UI
```

Список spec-файлов — в [`08-TESTING.md`](08-TESTING.md).

In-process Worker tests planned: **vitest@4** + **@cloudflare/vitest-pool-workers**.

**ВАЖНО:** Перед изменением парсера — `npm run test-parser` и `npm run test-parser-fixtures`.

---

## Frontend (UI)

Карта страниц, компонентов, PageToolbar, мобильная вёрстка — **[`04-FRONTEND.md`](04-FRONTEND.md)**.

---

## Tools and Libraries

### Backend Dependencies

- **cheerio** — Парсинг HTML (jQuery-like API)
- **iconv-lite** — Декодирование windows-1251 → UTF-8
- **better-sqlite3** — SQLite для локальной D1
- **xlsx** — Excel export

### Frontend Dependencies

- **React** — UI framework
- **Vite** — Build tool
- **TailwindCSS** — CSS framework
- **react-router-dom** — Routing
- **Lucide** — Icons
- **html-to-image** — Screenshots
- **xlsx** — Excel export

---

## Best Practices — Лучшие практики

### Предотвращение бесконечных циклов в useEffect

При синхронизации состояния с URL параметрами всегда проверяйте, действительно ли значения изменились перед обновлением URL:

```javascript
// ❌ ПЛОХО — вызывает бесконечный цикл
useEffect(() => {
  const params = new URLSearchParams(searchParams)
  if (filterBreed) params.set('breed', filterBreed)
  if (filterYear) params.set('year', filterYear)
  setSearchParams(params)
}, [filterBreed, filterYear, setSearchParams, searchParams])
```

```javascript
// ✅ ХОРОШО — проверяет изменения перед обновлением
useEffect(() => {
  const params = new URLSearchParams(searchParams)
  
  // Проверяем, нужно ли обновлять URL
  const needsUpdate = 
    (filterBreed !== params.get('breed')) ||
    (filterYear !== params.get('year'))
  
  if (!needsUpdate) return
  
  // Обновляем только если значения изменились
  const newParams = new URLSearchParams()
  if (filterBreed) newParams.set('breed', filterBreed)
  if (filterYear) newParams.set('year', filterYear)
  setSearchParams(newParams)
}, [filterBreed, filterYear, setSearchParams, searchParams])
```

### Предотвращение фликера при загрузке данных

Используйте `isInitialLoad` состояние для показа SkeletonLoader только при первой загрузке:

```javascript
const [isInitialLoad, setIsInitialLoad] = useState(true)

const { data, isLoading } = useApi(params)

useEffect(() => {
  if (!isLoading && data?.length > 0) {
    setIsInitialLoad(false)
  }
}, [isLoading, data?.length])

if (isInitialLoad && isLoading) {
  return <SkeletonLoader variant="card" count={4} />
}
```

### Dark Mode для компонентов

При добавлении новых компонентов всегда добавляйте dark mode варианты:

```javascript
// Фоны
bg-white dark:bg-charcoal-800
bg-cream-50 dark:bg-charcoal-900

// Границы
border-old-money-200 dark:border-charcoal-600

// Текст
text-charcoal-900 dark:text-charcoal-100
text-old-money-800 dark:text-old-money-300

// Hover состояния
hover:bg-cream-50 dark:hover:bg-charcoal-700
```

---

## Полезные ссылки

- Парсеры: `backend/parsers/`
- API routes: `backend/src/routes/`
- React pages: `frontend/src/pages/`
- React components: `frontend/src/components/`
- API client: `frontend/src/services/api.ts`
- Schema: `backend/schema.sql`
- Wrangler config: `wrangler.toml`

---

## См. также

- [04-FRONTEND.md](04-FRONTEND.md) — UI, маршруты, PageToolbar
- [20-OPERATIONS.md](20-OPERATIONS.md) — runbook деплоя и диагностики
- [14-PARSING-RULES.md](14-PARSING-RULES.md) — Правила парсинга данных
- [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) — Детали парсеров
- [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) — Схема БД
- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Workflow БД
- [05-API-REFERENCE.md](05-API-REFERENCE.md) — Документация API

---

## Deployment — Деплой и инфраструктура

### Обзор

**Стек (прод):**
- Cloudflare Pages — фронтенд + статика `data/v1/` на CDN
- Локальная админка — `local-dev-server.ts` (`npm run dev`)
- Cloudflare D1 — импорт (парсеры, cron), не runtime публичного сайта

**Домены:**
- Сайт и данные: https://coursing-stats.ru (`/data/v1/`)
- GitHub: https://github.com/antajl/Coursing-Stats

### Cloudflare Pages

**Проект Pages:** `coursingstats`

**Source:** GitHub repository `antajl/Coursing-Stats`

**Build settings:**
- Build command: `cd frontend && npm run build`
- Build output directory: `frontend/dist`

**Environment variables:** не требуются для прод-сборки (данные с `/data/v1/` на том же домене).

### GitHub Actions

**Workflow:** `.github/workflows/deploy-frontend.yml`

**Триггеры:**
- Push в ветку `main`
- Manual dispatch

**Процесс:**
1. Checkout кода
2. `npm run build-all-data` (indexes + package `data/v1/`)
3. Build фронтенда
4. Deploy на Cloudflare Pages (Worker **не** деплоится)

### Cloudflare Worker (legacy)

Код в `backend/src/worker.ts` — для `npm run dev:d1`. **Не деплоится в CI** с 2026-07-07. См. [`03-DATA.md`](03-DATA.md).

### SPA Routing и кэш ассетов

`frontend/public/_redirects`:
```
/*    /index.html   200
```

**Критично:** не класть корневой `404.html` в `public/` — Cloudflare Pages тогда **отключает SPA-режим**, и `/competitions`, `/shows`, … отдают 404. Не использовать rewrite `/assets/* … 404` в `_redirects` (status 404 на Pages **не поддерживается**).

Vite: `assets/[name]-[hash].js` + `banner` с build stamp (новые хэши каждый CI deploy).

HTML no-cache + авто-reload: [`20-OPERATIONS.md`](20-OPERATIONS.md) → «Кэш фронта».

### GitHub Actions Workflows

**deploy-frontend.yml:** Деплой фронтенда на Cloudflare Pages
**update-db.yml:** Обновление D1 — **только вручную** (`workflow_dispatch`)
**update-speed-records.yml:** только `data/v1/donino/speed_records.json` (cron **4×/день**); **не** обновляет бега 350 м. Полный Донино: `scripts/update-donino.bat` + deploy.

**Secrets:**
- `CLOUDFLARE_API_TOKEN` — API токен Cloudflare (с правами D1 и Workers)
- `CLOUDFLARE_ACCOUNT_ID` — ID аккаунта Cloudflare

### Cloudflare D1

**Local Development:**
```bash
cd backend
npx wrangler d1 execute pc-db --local --command="SELECT * FROM events LIMIT 5"
```

**Remote Development:**
```bash
cd backend
npx wrangler d1 execute pc-db --command="SELECT * FROM events LIMIT 5"
```

**Import/Export:**
```bash
npx wrangler d1 execute pc-db --file=script.sql
npx wrangler d1 execute pc-db --local --file=script.sql
```

### Мониторинг

**Legacy Worker logs** (если снова задеплоите Worker):
```bash
npx wrangler tail coursingstatsworker
```

**D1 Queries:**
```bash
npx wrangler d1 execute pc-db --command="EXPLAIN QUERY PLAN SELECT * FROM events"
```

---

## Frontend Map

Полная карта маршрутов, страниц и компонентов — **[`04-FRONTEND.md`](04-FRONTEND.md)**.

---

## Отладка парсеров с фикстурами

### Задача
Исправить парсеры результатов (coursing, BZMP, racing) для работы с реальными HTML страницами procoursing.ru.

### Проблема
Парсеры не могли распознать структуру HTML таблиц в реальных фикстурах и возвращали 0 результатов.

### Выполненные работы

**1. Создание структуры для фикстур**
- Папки: `backend/tests/fixtures/{coursing,bzmp,racing}`
- Скрипт `download-fixtures.ts` для загрузки реальных HTML страниц

**2. Загруженные фикстуры**

**Coursing:** `Complete_Results_2025-03-08.html`, `Complete_Results_2025-04-05_C.html`, `Complete_Results_2025-04-06_C.html`

**BZMP:** `Complete_Results_2025-03-08.html`, `Complete_Results_2025-04-05_B.html`, `Complete_Results_2025-04-06_B.html`

**Racing:** `2026-05-16_Complete_Results_Racing.html`, `Complete_Results_2025-cc-sample.html`

**3. Исправления в парсерах**

Убрана проверка `bgcolor="#c0c0c0"` для заголовков групп. Заголовки теперь распознаются по `colspan=25` и наличию жирного текста.

**4. Команды**
```bash
npm run test-parser-fixtures
npm run download-fixtures
```

### Технические детали

**Кодировка:** Сайт procoursing.ru использует windows-1251 без charset. Все парсеры используют `fetchWin1251`.

**Структура HTML:**
- Coursing/BZMP: 25 колонок, rowspan=2, судейские оценки
- Racing: 18 колонок, нет rowspan, время/скорость
