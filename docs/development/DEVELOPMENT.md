# Development — Разработка

Документация по разработке Coursing Stats.

## File Structure

### Backend

```
backend/
├── src/
│   ├── worker.ts              # Cloudflare Worker entry point (8-строчная обёртка, делегирует в app.ts)
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
│   │   ├── ui/                # Custom Button, Card, Badge (NOT shadcn)
│   │   ├── DogStatsTable.tsx
│   │   ├── FiltersDropdown.tsx
│   │   └── …
│   ├── pages/
│   │   ├── Home.tsx           # Landing (WIP)
│   │   ├── Competitions.tsx    # Tab hub: Events, TopDogs, Judges
│   │   ├── TopDogs/           # index, TopDogsFilters, TopDogsTabs, filterUtils
│   │   ├── DogProfile.tsx
│   │   ├── DoninoDogProfile.tsx
│   │   ├── Events/
│   │   │   ├── index.tsx      # Calendar
│   │   │   └── EventResults/  # index, EventHeader, details/{Racing,Scoring}Detail
│   │   ├── Judges/
│   │   └── SpeedRecords/      # index, SpeedTableTab, CoursingTableTab, Stats
│   ├── services/api.ts
│   └── lib/
│       ├── query-client.tsx, icons.ts
│       └── recordDates.ts     # Donino dates (Excel serial, dedupe)
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
│   ├── start-local.bat
│   └── push-github.bat
└── assets/                    # Static assets
    └── logo.svg (renamed from 2.svg)
```

---

## NPM Scripts

### Root scripts

```bash
npm run dev                    # Start both servers (Worker + Vite)
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
# D1 workflow: docs/data/CALENDAR-AND-DB-UPDATE.md
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
scripts/start-local.bat
```

**Вручную:**

Терминал 1:
```bash
cd backend
npx wrangler dev --remote --port 8787
# Запускается на http://127.0.0.1:8787
```

Терминал 2:
```bash
cd frontend
npm run dev
# Запускается на http://localhost:5173
```

**ВАЖНО:** Серверы МОЖНО запускать командами. Это разрешено и рекомендуется для разработки.

`npm run dev` запускает Worker с **`--remote`** (актуальная D1) и Vite одновременно.

**Тема UI:** светлая по умолчанию; тёмная — через переключатель в Nav (`localStorage.theme`).

### Использование remote D1

Для локальной разработки используется remote D1 (--remote флаг). Это гарантирует работу с актуальными данными.

---

## Testing

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

In-process Worker tests planned: **vitest@4** + **@cloudflare/vitest-pool-workers**.

**ВАЖНО:** Перед изменением парсера — `npm run test-parser` и `npm run test-parser-fixtures`.

---

## Code Splitting

### Статус (2026-07): в процессе, основное сделано

- ✅ `AppRoutes.tsx` — все страницы через `React.lazy()` + `Suspense`
- ✅ `Competitions.tsx` — вложенный lazy для Events / TopDogs / Judges
- ✅ `Nav.tsx` вынесен из `App.tsx`
- ✅ `vite.config.ts` — `manualChunks` (vendor-react, vendor-router, vendor-query, vendor-xlsx, …)
- 🔄 `Home.tsx` — лендинг в разработке

Подробнее о маршрутах: `docs/development/FRONTEND-MAP.md`

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

**Events/index.jsx:**
- Карточки вместо таблицы на мобильных
- Фильтр по годам вынесен из "больше фильтров"
- Поиск и фильтры на разных строках на мобильных
- Легенда дисциплин скрыта на мобильных

**Judges/index.tsx:**
- Карточки с именем судьи и статистикой в grid 2x2 на мобильных

**SpeedRecords/index.tsx:**
- Карточки с кличкой, породой, полом, датой и скоростью на мобильных

**DogStatsTable.tsx (TopDogs):**
- Карточки с кличкой и статистикой в зависимости от типа (места/очки/скорость)
- Медали в заголовках таблицы; в ячейках — числа (grid-cols-4 на мобильных)

**DogProfile.tsx:**
- Уменьшенные отступы и размеры на мобильных
- Стрелочка "←" скрыта на мобильных

**Competitions.tsx:**
- Табы с flex-wrap и min-width
- Вкладки вертикальные с сокращёнными названиями на мобильных

**SpeedRecords/Stats.jsx:**
- Фильтры с flex-wrap
- Grid 2x2 на мобильных

**Judges/JudgeDetail.jsx:**
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

- [data/PARSING.md](../data/PARSING.md) — Парсинг данных
- [data/DATABASE.md](../data/DATABASE.md) — Работа с БД
- [development/FRONTEND-MAP.md](FRONTEND-MAP.md) — навигация фронтенда
- [development/DEPLOYMENT.md](DEPLOYMENT.md) — Деплой и инфраструктура
- [architecture/API-REFERENCE.md](../architecture/API-REFERENCE.md) — Документация API
