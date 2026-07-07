# Development — Разработка

> **ИИ:** начни с [README.md](README.md) → [AI-GUIDE.md](AI-GUIDE.md) → [DATA.md](DATA.md). Этот файл — фронтенд, скрипты, деплой.

Документация по разработке Coursing Stats.

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
├── parsers/                   # Data parsers (v1 + v2 modular)
│   ├── parse-results-coursing.ts  # v1 — reparse, CLI
│   ├── parse-results-bzmp.ts      # v1
│   ├── parse-results-racing.ts    # v1
│   ├── coursing/index.ts          # v2 modular (target)
│   ├── bzmp/index.ts              # v2 modular
│   ├── racing/index.ts            # v2 modular
│   ├── calendar/scrape-year-page.ts  # календарь s_{YEAR}.html
│   └── unique/                    # v2 shared row/header parsers
├── scripts/                   # All .ts, run via npx tsx
│   ├── scrape/
│   │   └── scrape-year-index.ts
│   ├── load/
│   │   ├── load-events.ts
│   │   └── split-sql-batches.ts   # разбивка reparse SQL для remote D1
│   ├── reparse/
│   ├── migrate/
│   ├── sync/
│   ├── update/
│   ├── speed/
│   ├── test/                  # See test/README.md
│   │   ├── test-parser.ts, test-parsers-fixtures.ts
│   │   ├── download-fixtures.ts, smoke-api.ts, compare-parsers.ts
│   │   └── debug/             # One-off investigation scripts
│   ├── ci/
│   └── archive/               # One-time scripts (DO NOT REUSE)
├── lib/
│   ├── fetch-win1251.ts
│   └── dog-lookup.ts
├── tests/
│   ├── api.test.ts            # describe.skip — use smoke-api.ts until vitest@4
│   └── fixtures/              # Real HTML: coursing/, bzmp/, racing/
```

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
│   │   ├── toolbar/           # PageToolbar, ToolbarSegmentControl, RecordsListToolbar, …
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
│   │   ├── TopDogs/           # index, TopDogsFilters, TopDogsTabs, filterUtils
│   │   ├── DogProfile.tsx
│   │   ├── DoninoDogProfile.tsx
│   │   ├── Events/
│   │   │   ├── index.tsx      # Calendar
│   │   │   └── EventResults/  # index, EventHeader, details/{Racing,Scoring}Detail
│   │   ├── Judges/
│   │   └── SpeedRecords/      # Donino hub: две колонки, записи + статистика
│   ├── services/api.ts
│   └── lib/
│       ├── query-client.tsx, icons.ts
│       ├── toolbar.ts         # Tailwind class bundles for PageToolbar
│       ├── ownerMarks.ts      # Owner crown marks (frontend-only)
│       └── recordDates.ts     # Donino dates (Excel serial, dedupe, expandCoursingTimeline)
├── public/
├── package.json
├── vite.config.ts             # TypeScript; manualChunks for vendors
└── tailwind.config.js
```

### Data Directory

```
data/
├── events/                    # JSON event files
│   ├── events-2023.json
│   ├── events-2024.json
│   ├── events-2025.json
│   ├── events-2026.json
│   ├── events-historical.json
│   └── events.json
├── migrations/                # SQL migrations
│   ├── migrate-add-judges.sql
│   ├── migrate-add-track-schemes.sql
│   ├── migrate-normalize-dogs.sql
│   ├── migrate-normalize-total-score.sql
│   ├── migrate-remote-schema.sql
│   ├── migrate-simplify-statuses.sql
│   └── migrate-speed-records-history.sql
├── exports/                   # SQL exports (for sync)
│   ├── sync-events.sql
│   ├── sync-results.sql
│   └── sync-dogs.sql
├── imports/                   # SQL imports (for load)
│   ├── load-events.sql
│   ├── load-results.sql
│   └── speed-records.sql
├── updates/                   # SQL updates
│   ├── update-judges.sql
│   ├── update-missing-bib-numbers.sql
│   ├── update-raw-scores.sql
│   ├── update-status-reasons.sql
│   └── update-track-schemes.sql
└── temp/                      # Temporary files
    └── sync-local-to-remote.sql
```

### Root Directory

```
/
├── README.md
├── package.json
├── package-lock.json          # В репозитории (npm ci в CI)
├── wrangler.toml
├── scripts/                   # Batch/Shell scripts
│   ├── start-servers.bat
│   └── deploy-to-github.bat
└── assets/                    # Static assets
    └── logo.svg (renamed from 2.svg)
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
npm run sync-from-remote         # remote D1 → local (перед первым dev)
npm run dev:remote               # dev с remote D1 (жрёт квоту reads!)
npm run export-archive           # полный файловый архив → data/archive/snapshots/
npm run generate-favicon         # favicon.ico из favicon.svg
npm run sync-to-remote         # Full sync local D1 → remote
npm run update-current-year    # Update current year events
npm run merge-dogs             # Merge duplicate dogs
npm run fetch-speed-records    # Fetch speed records
npm run test-parser            # Synthetic parser tests (v1)
npm run test-parser-fixtures   # v2 modular parsers on real HTML fixtures
npm run download-fixtures      # Download fixtures from procoursing.ru
npm run smoke-api              # Manual API smoke test (needs npm run dev)
npm test                       # vitest (api.test.ts currently skipped; includes calendar-scrape.test.ts)
# Calendar fixtures: npx tsx backend/scripts/test/download-calendar-fixtures.ts
# Split large reparse SQL: npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql
# D1 workflow: см. DATABASE.md — секция «Календарь и обновление D1»
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
scripts\start-servers.bat
```

**Первый запуск (или после sync D1):**
```bash
npm run export-local-data -- --local   # при необходимости
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

См. `DATA-ARCHIVE.md`.

### React Query (frontend)

`frontend/src/hooks/useApi.ts` — `staleTime` на prod (меньше дублей к `/data/v1/`). События не refetch на каждый mount.

---

## Testing

Подробно: **`TESTING.md`**.

### Parser Testing

```bash
npm run test-parser              # v1 synthetic tests
npm run test-parser-fixtures     # v2 modular on backend/tests/fixtures/
npm run download-fixtures        # refresh fixtures from live URLs
npx tsx backend/scripts/test/compare-parsers.ts  # v1 vs v2 comparison
```

### CLI Mode (v1 parsers)

```bash
npx tsx backend/parsers/parse-results-coursing.ts <url>
npx tsx backend/parsers/parse-results-bzmp.ts <url>
npx tsx backend/parsers/parse-results-racing.ts <url>
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

Список spec-файлов — в `TESTING.md`.

In-process Worker tests planned: **vitest@4** + **@cloudflare/vitest-pool-workers**.

**ВАЖНО:** Перед изменением парсера — `npm run test-parser` и `npm run test-parser-fixtures`.

---

## Code Splitting

### Статус (2026-07): в процессе, основное сделано

- ✅ `AppRoutes.tsx` — все top-level страницы через `React.lazy()` + `Suspense`
- ✅ `Competitions.tsx` — вкладки Events / TopDogs / Judges (статический import, mount по `activeTab`)
- ✅ `Nav.tsx` вынесен из `App.tsx`
- ✅ `vite.config.ts` — `manualChunks` (vendor-react, vendor-router, vendor-query, vendor-xlsx, …)
Подробнее о маршрутах: см. раздел «Frontend map — навигация для ИИ-агентов» в этом файле

---

## PageToolbar — единый паттерн фильтров (2026-07)

**Файлы:** `frontend/src/components/toolbar/`, стили в `frontend/src/lib/toolbar.ts`

| Компонент | Назначение |
|-----------|------------|
| `PageToolbar` | Обёртка: строка фильтров, активные чипы, нижний ряд (сегменты / сортировка) |
| `ToolbarSegmentControl` | Переключатель вкладок (медали/очки/скорость, замер/статистика, …) |
| `ToolbarSearch` | Поиск в тулбаре |
| `ToolbarOptionBar` | Сортировка чипами |
| `ToolbarActiveFilters` | Сбрасываемые чипы активных фильтров |
| `RecordsListToolbar` | Тулбар списка рекордов (скорость / coursing) |
| `MultiFilterDropdown` | Мультивыбор в dropdown; обёртка `w-fit shrink-0` (не растягивать строку) |

**Где используется:** `TopDogsFilters`, `Judges/index`, `Events/index.tsx` (календарь), `DoninoPageToolbar` (рекорды Донино), главная (сегменты топа).

Легаси (не в основном flow): `SpeedTableTab`, `CoursingTableTab`, `SpeedStatsView`, `CoursingStatsView`.

**`FilterSelect`:** prop `className` — только на обёртке `<div>`; у `<select>` — `w-full min-w-0`. Для породы/года задавать фиксированную ширину обёртки (`w-[10.5rem]`, `w-[6.75rem]`), иначе нативный select растягивается по самой длинной опции.

---

## Главная страница (`Home.tsx`)

- **Hero:** `hero-dashboard` — intro + ближайшие события (`HomeEventRow`)
- **StatsStrip:** кликабельные чипы → календарь / рейтинг / справочник
- **Топ сезона:** `ToolbarSegmentControl` + подиум (`podium-preview`, `PodiumRankMark`, `MedalTally nowrap`)
- **Донино:** две колонки (`donino-home-columns`) — замер и бега 350 м; строки `DoninoHomeRecordRow`
- **Стили:** часть в `frontend/src/index.css` (`.hero-dashboard`, `.pod-card`, `.donino-home-*`, `.owner-crown-name`)

---

## Профили собак — соревнования vs Донино

| | `/dog/:id` | `/donino-dog/:name/:breed` |
|---|------------|----------------------------|
| Данные | `dogs` + `results` | `speed_records` + `coursing_records` |
| Шапка | Имя, титулы-чипы, экспорт PNG | Имя, порода, назад |
| Дисциплины на странице | Курсинг/БЗМП, бега procoursing | Замер (warm-blue), бега 350 м (forest) |
| История бегов 350 м | `expandCoursingTimeline(coursingRecords)` | то же |
| Процентиль в UI | убран из блоков Донино | убран |

**Важно:** у одной собаки может быть много замеров скорости и один забег 350 м в БД — это нормально (разные источники). История бегов показывает все точки из `history` JSON + текущая строка.

**Owner marks:** `frontend/src/lib/ownerMarks.ts` — список кличек для короны; не связывает Донино и соревнования в D1. Редактировать только по явной просьбе владельца сайта.

---

## Мобильная адаптивность

### Обзор
Сайт полностью адаптирован для мобильных устройств с использованием TailwindCSS брейкпоинтов (`md:`).

### Реализация

**App.tsx:**
- Мобильная шапка с лого слева и кнопкой меню справа
- Контент на всю ширину экрана на мобильных
- Убран футер

**Страницы:**

**Events/index.tsx:**
- `PageToolbar` — поиск, год, дисциплина, вид соревнования; пресеты; легенда
- Список `EventListRow` (не таблица); группировка по месяцам
- URL sync через `setSearchParams(prev => …)` — сохраняет `?tab=` и прочие параметры hub

**TopDogs/index.tsx:**
- Тулбар виден при первой загрузке; скелетон только под списком

**SpeedRecords/index.tsx:**
- Переключатель **Записи | Статистика** над тулбаром (`ViewToggle`)
- Две колонки: Замер | Бега 350 м (на всех ширинах — стек на мобиле)
- Записи: `DoninoListRecordRow`, infinite scroll; пол — только левая колонка
- Статистика: общая группировка, карточки групп, свёрнутые графики

**DogStatsTable.tsx (TopDogs):**
- Карточки с кличкой и статистикой в зависимости от типа (места/очки/скорость)
- Медали в заголовках таблицы; в ячейках — числа (grid-cols-4 на мобильных)

**DogProfile.tsx:**
- Уменьшенные отступы и размеры на мобильных
- Стрелочка "←" скрыта на мобильных

**Competitions.tsx:**
- `ToolbarSegmentControl` — Календарь | Рейтинг | Судьи
- Вкладки монтируются только при выборе (`activeTab === 'ranking' && …`); статический import (без nested lazy)

**Judges/index.tsx:**
- Адалтивные фильтры и таблицы с overflow-x-auto
- Статистика по породам и критериям: карточки на мобильных, таблицы на десктопе
- Стрелочки "←" скрыты на мобильных

**Events/EventResults.jsx:**
- Детальные оценки: карточки для каждого забега на мобильных
- Причины отстранения под именем на мобильных, справа на десктопе
- Стрелочка "←" скрыта на мобильных

**DogTooltip.jsx:**
- Ширина 320px на мобильных, 440px на десктопе

**FiltersDropdown.jsx:**
- Ширина 320px на мобильных, 600px на десктопе

### Технические детали

- Все изменения используют Tailwind брейкпоинты (`md:`) для сохранения десктопного вида
- Таблицы на мобильных заменены на карточки с `md:hidden` / `hidden md:block`
- Фильтры используют `flex-wrap` и `min-w-*` для адаптивности
- Контент использует `w-full md:max-w-7xl` и `px-2 sm:px-4 md:px-6 lg:px-8`

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

- [PARSING.md](PARSING.md) — Парсинг данных
- [DATABASE.md](DATABASE.md) — Работа с БД
- [API-REFERENCE.md](API-REFERENCE.md) — Документация API

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

Код в `backend/src/worker.ts` — для `npm run dev:d1`. **Не деплоится в CI** с 2026-07-07. См. `docs/DATA.md`.

### SPA Routing

Файл `frontend/public/_redirects`:
```
/* /index.html 200
```

Это обеспечивает корректную работу React Router на Cloudflare Pages.

### GitHub Actions Workflows

**deploy-frontend.yml:** Деплой фронтенда на Cloudflare Pages
**update-db.yml:** Обновление D1 — **только вручную** (`workflow_dispatch`)
**update-speed-records.yml:** Donino speed → D1 + `data/v1/` (cron **4×/день** — 05:00, 11:00, 17:00, 20:30 UTC ≈ 08:00, 14:00, 20:00, 23:30 МСК); push триггерит deploy

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

## Frontend Map — Навигация для ИИ-агентов

### Shell и маршрутизация

| Файл | Роль |
|------|------|
| `frontend/src/App.tsx` | Shell: `QueryProvider`, `Router`, `Nav`, `AppRoutes`, skip-link, layout |
| `frontend/src/AppRoutes.tsx` | Все top-level маршруты через `React.lazy()` + `Suspense` + `PageLoader` |
| `frontend/src/components/Nav.tsx` | Шапка: `.nav-glass`, лого слева / ссылки по центру экрана / тема+источники справа, мобильное меню |
| `frontend/src/components/ThemeToggle.tsx` | Переключатель темы; по умолчанию light |
| `frontend/vite.config.ts` | Vite (TypeScript); `manualChunks` для vendor и code-splitting |

**Нет shadcn/ui** — UI в `frontend/src/components/ui/` (`Button`, `Card`, `Badge` и др.).

### Маршруты (`AppRoutes.tsx`)

| Path | Компонент | Описание |
|------|-----------|----------|
| `/` | `Home.tsx` | Лендинг: hero, счётчики, топ сезона, рекорды Донино |
| `/competitions` | `Competitions.tsx` | Hub вкладок соревнований procoursing.ru |
| `/top` | `TopDogs/index.tsx` | Прямой доступ к рейтингу (`?rankingTab=score` \| `speed`) |
| `/dog/:id` | `DogProfile.tsx` | Профиль собаки из БД соревнований |
| `/event/:id` | `Events/EventResults/` | Результаты одного события |
| `/speed-records` | `SpeedRecords/index.tsx` | Рекорды Донино (отдельный источник данных) |
| `/donino-dog/:name/:breed` | `DoninoDogProfile.tsx` | Профиль собаки из рекордов Донино |
| `/judges` | `Judges/index.tsx` | Список судей |
| `/judges/:judgeId` | `Judges/JudgeDetail.tsx` | Детальная статистика судьи |

### Competitions = tab hub

`Competitions.tsx` — контейнер вкладок для procoursing.ru (статический import дочерних страниц):

| Вкладка (`?tab=`) | Компонент | Содержимое |
|-------------------|-----------|------------|
| `calendar` (default) | `Events/index.tsx` | Календарь: `PageToolbar`, `EventListRow` |
| `ranking` | `TopDogs/index.tsx` | Рейтинг: места / очки / скорость |
| `judges` | `Judges/index.tsx` | Судьи |

`Events/index.tsx` при синхронизации фильтров в URL **не затирает** `tab` и параметры других вкладок (`setSearchParams` с функцией-updater).

### SpeedRecords ≠ competitions

**Рекорды Донино** — отдельная вертикаль:
- Данные: Google Sheets → D1 `speed_records` + `coursing_records`, не procoursing.ru
- Маршрут: `/speed-records` (в Nav — «Рекорды Донино»)
- Layout: **одна страница, две колонки**; `?view=stats` для статистики; `?groupBy=breed|sex|year`
- Профили: `/donino-dog/:name/:breed` (кириллические клички из таблицы)
- Не путать с `/dog/:id` (собаки из `dogs` + `results` соревнований)

### Два соглашения об именах собак

**Соревнования (procoursing.ru):**
- `name_lat` — латиница (основное в таблицах)
- `name_ru` — кириллица (подпись вторым рядом, если есть)

**Донино (speed_records):**
- Одно поле `name` — преимущественно кириллица
- Порода и пол в формате таблицы Google Sheets (`С`/`К`)

### Календарь событий (`Events/`)

| Файл | Роль |
|------|------|
| `index.tsx` | Фильтры, группировка по месяцам, список |
| `EventListRow.tsx` | Одна строка события (клик → `/event/:id`) |
| `eventListUtils.ts` | Цвета дисциплин, `getEventHeadline`, `parseJudgeNames`, `groupEventsByMonth`, `getEventYear` |

### EventResults — разбивка по дисциплинам

Папка `frontend/src/pages/Events/EventResults/`:
- `index.tsx` — Загрузка event + results, layout
- `EventHeader.tsx` — Шапка события (судьи, схемы трасс)
- `ResultsSection.tsx` — Группы по `breed_class`
- `ResultCard.tsx` — `<details>` на одну собаку
- `ResultSummary.tsx` — Строка summary (место, кличка, баллы)
- `details/RacingDetail.tsx` — Бега борзых (время и скорость)
- `details/ScoringDetail.tsx` — Курсинг + БЗМП (общий UI оценок судей)

### TopDogs

```
frontend/src/pages/TopDogs/
  index.tsx           — hooks, API, filtered data
  TopDogsFilters.tsx  — PageToolbar: поиск, год, порода, сегмент рейтинга, сортировка
  TopDogsTabs.tsx     — вкладки + DogStatsTable
  filterUtils.ts      — filterPlacement/Score/Speed
```

Активные фильтры и сброс: `frontend/src/pages/SpeedRecords/toolbarFilters.ts` (`buildTopDogsActiveFilterChips`, …)

### SpeedRecords

```
frontend/src/pages/SpeedRecords/
  index.tsx                 — shell: DoninoPageToolbar + Records | Stats
  useSpeedRecordsPage.ts    — state, URL (?view, ?groupBy), API (limit 1000)
  DoninoPageToolbar.tsx     — ViewToggle + PageToolbar + подсказки фильтров
  DoninoRecordsColumns.tsx  — две колонки списка, сортировка, infinite scroll
  DoninoListRecordRow.tsx   — строка списка (sparkline, скрин)
  DoninoStatsColumns.tsx    — статистика: группировка, графики, карточки групп
  DoninoColumnPlaque.tsx    — плашка колонки (записи)
  stats/
    DoninoStatsSummary.tsx  — шапка колонки в статистике (плашка + метрики)
    DoninoGroupCard.tsx     — карточка группы (порода/пол/год)
    DoninoGroupCardList.tsx
    doninoStatsUtils.ts     — фильтры, группировка, дедуп
    statsUi.tsx             — DistributionChart, CollapsibleDistributionChart
    DogSearchCard.tsx
  hooks/useInfiniteScroll.ts
  exportExcel.ts            — Excel: листы «Замер» + «Бега 350 м»
  toolbarFilters.ts
  RecordSortBar.tsx

Легаси (не в основном flow): SpeedTableTab, CoursingTableTab, SpeedRecordCard,
  CoursingRecordCard, stats/SpeedStatsView, stats/CoursingStatsView, …
```

**Общие компоненты:** `SpeedHistorySparkline.tsx`, `SpeedStatusBadge.tsx`, `DogSexIcon.tsx`

**Даты и статистика 350 м:** `frontend/src/lib/recordDates.ts`
- `formatDoninoSpeedKmh` — км/ч без лишнего `.0`
- `dedupeByRecordDate` — один пункт на календарную дату (графики замера)
- `expandCoursingTimeline` — для профиля: все забеги 350 м (текущая строка + `history` JSON)

**CSS (статистика):** `index.css` — `.donino-stats-column-header`, `.donino-group-card`, `.donino-stats-chart`

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
