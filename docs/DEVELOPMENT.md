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
│   │   └── SpeedRecords/      # карточный список, Stats, exportExcel
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

**Где используется:** `TopDogsFilters`, `Judges/index`, `SpeedTableTab`, `CoursingTableTab`, `SpeedStatsView`, `CoursingStatsView`, главная (сегменты топа).

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

**Events/index.jsx:**
- Карточки вместо таблицы на мобильных
- Фильтр по годам вынесен из "больше фильтров"
- Поиск и фильтры на разных строках на мобильных
- Легенда дисциплин скрыта на мобильных

**Judges/index.tsx:**
- Карточки с именем судьи и статистикой в grid 2x2 на мобильных

**SpeedRecords/index.tsx:**
- Вкладки «Замер скорости» / «Бега борзых»; внутри — **Таблица | Статистика** (`?view=stats`)
- Список записей — карточки на всю строку (`SpeedRecordCard`, `CoursingRecordCard`), не HTML-таблица; sparkline истории скорости в центре карточки

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

- [PARSING.md](PARSING.md) — Парсинг данных
- [DATABASE.md](DATABASE.md) — Работа с БД
- [API-REFERENCE.md](API-REFERENCE.md) — Документация API

---

## Deployment — Деплой и инфраструктура

### Обзор

**Стек:**
- Cloudflare Pages — фронтенд
- Cloudflare Worker — бэкенд (API)
- Cloudflare D1 — база данных (SQLite)

**Домены:**
- Фронтенд: https://coursing-stats.ru
- API: https://api.coursing-stats.ru
- GitHub: https://github.com/antajl/Coursing-Stats

### Cloudflare Pages

**Проект Pages:** `coursingstats`

**Source:** GitHub repository `antajl/Coursing-Stats`

**Build settings:**
- Build command: `cd frontend && npm run build`
- Build output directory: `frontend/dist`

**Environment variables:**
- `VITE_API_URL`: `https://api.coursing-stats.ru`

> ⚠️ **Важно:** сборка фронтенда фактически выполняется в GitHub Actions (`npm run build`), а Cloudflare Pages только принимает уже готовый `frontend/dist` через `wrangler pages deploy`. Переменные окружения из этого раздела Cloudflare Pages **не участвуют** в сборке и ни на что не влияют, пока сборку делает GitHub Actions. Реальный источник `VITE_API_URL` для прод-сборки — переменная `env:` в шаге `Build frontend` файла `.github/workflows/deploy-frontend.yml`. Значение здесь оставлено только для справки/на случай ручной сборки через Cloudflare Pages.

### GitHub Actions

**Workflow:** `.github/workflows/deploy-frontend.yml`

**Триггеры:**
- Push в ветку `main`
- Manual dispatch

**Процесс:**
1. Checkout кода
2. Установка зависимостей
3. Build фронтенда
4. Деплой на Cloudflare Pages

### SPA Routing

Файл `frontend/public/_redirects`:
```
/* /index.html 200
```

Это обеспечивает корректную работу React Router на Cloudflare Pages.

### Cloudflare Worker

**Worker name:** `coursingstatsworker`

**Main:** `backend/src/worker.ts`

**Compatibility date:** 2024-01-01

**D1 Binding:**
- Database name: `pc-db`
- Database ID: `a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4`
- Binding name: `DB`

**wrangler.toml:**
```toml
name = "coursingstatsworker"
main = "backend/src/worker.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "pc-db"
database_id = "a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4"
```

**Secrets:**
- `ADMIN_API_TOKEN` — токен для авторизации admin endpoints

### GitHub Actions Workflows

**deploy-frontend.yml:** Деплой фронтенда на Cloudflare Pages
**update-db.yml:** Обновление D1 базы данных (cron: понедельник 02:00 UTC)
**update-speed-records.yml:** Обновление рекордов скорости из Google Sheets (cron: **4×/день** — 05:00, 11:00, 17:00, 20:30 UTC ≈ 08:00, 14:00, 20:00, 23:30 МСК)

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

**Worker Logs:**
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

`Competitions.tsx` — контейнер вкладок для procoursing.ru:

| Вкладка (`?tab=`) | Компонент | Содержимое |
|-------------------|-----------|------------|
| `calendar` (default) | `Events/index.tsx` | Календарь событий |
| `ranking` | `TopDogs/index.tsx` | Рейтинг: места / очки / скорость |
| `judges` | `Judges/index.tsx` | Судьи |

### SpeedRecords ≠ competitions

**Рекорды Донино** — отдельная вертикаль:
- Данные: Google Sheets → D1 `speed_records`, не procoursing.ru
- Маршрут: `/speed-records` (в Nav — «Рекорды Донино»)
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
  index.tsx              — вкладки (shell)
  useSpeedRecordsPage.ts — state, memos, handlers
  SpeedTableTab.tsx      — замер скорости: фильтры, сортировка, список карточек
  SpeedRecordCard.tsx    — карточка замера (клик → профиль Донино, sparkline, бейджи)
  CoursingTableTab.tsx   — бега 350 м: список карточек
  CoursingRecordCard.tsx — карточка бега
  RecordSortBar.tsx      — кнопки сортировки (замер скорости)
  exportExcel.ts         — lazy xlsx export
  stats/                 — SpeedStatsView, CoursingStatsView, …
```

**Общие компоненты:** `frontend/src/components/SpeedHistorySparkline.tsx`, `SpeedStatusBadge.tsx`, `DogSexIcon.tsx`

**Даты и статистика 350 м:** `frontend/src/lib/recordDates.ts`
- `dedupeByRecordDate` — один пункт на календарную дату (графики замера)
- `expandCoursingTimeline` — для профиля: все забеги 350 м (текущая строка + `history` JSON)

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
