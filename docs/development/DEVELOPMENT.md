# Development — Разработка

Документация по разработке ProCoursing Stats.

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
├── parsers/                   # Data parsers
│   ├── parse-results-coursing.ts  # Coursing parser (~39 KB)
│   ├── parse-results-bzmp.ts      # BZMP parser (~30 KB)
│   └── parse-results-racing.ts    # Racing parser (~14 KB)
├── scripts/                   # Data loading scripts (organized by folders)
│   ├── scrape/                # Scraping scripts
│   │   └── scrape-year-index.ts
│   ├── load/                  # Load scripts
│   │   ├── load-events.ts
│   │   └── load-results.ts
│   ├── reparse/               # Reparse scripts (after parser changes)
│   │   ├── reparse-bzmp-events.ts
│   │   ├── reparse-coursing-events.ts
│   │   └── reparse-racing-events.ts
│   ├── migrate/               # Migration scripts
│   │   └── migrate-normalize-dog-names.ts
│   ├── sync/                  # Sync scripts (local ↔ remote)
│   │   └── sync-local-to-remote.ts
│   ├── update/                # Update scripts
│   │   ├── update-current-year.ts
│   │   └── merge-dogs.ts
│   ├── speed/                 # Speed records scripts
│   │   ├── sync-speed-records.ts
│   │   └── fetch-speed-records-pdf.py
│   ├── test/                  # Test scripts
│   │   └── test-parser.ts
│   ├── ci/                    # CI/CD scripts (GitHub Actions)
│   │   └── ci-update-db.ts
│   └── archive/               # One-time scripts (DO NOT REUSE)
├── lib/                       # Common modules
│   ├── fetch-win1251.ts      # Windows-1251 decoding
│   └── dog-lookup.ts         # Dog name normalization
├── schema.sql                 # Database schema
└── tests/                     # Tests
    └── api.test.ts
```

### Frontend

```
frontend/
├── src/
│   ├── App.tsx                # Main component with navigation
│   ├── main.tsx               # Entry point
│   ├── constants.ts           # Constants (colors, statuses)
│   ├── components/            # React components
│   │   ├── DogSilhouettes.tsx
│   │   ├── DogStatsTable.tsx
│   │   ├── DogTooltip.tsx
│   │   ├── FilterSelect.tsx
│   │   └── FiltersDropdown.tsx
│   ├── pages/                 # React pages
│   │   ├── DogProfile.tsx
│   │   ├── DoninoDogProfile.tsx # Donino dog profile with speed stats
│   │   ├── Events/            # Events pages
│   │   │   ├── index.tsx       # Events list (from Events.tsx)
│   │   │   └── EventResults.tsx
│   │   ├── Judges/            # Judges pages
│   │   │   ├── index.tsx       # Judges list (from Judges.tsx)
│   │   │   └── JudgeDetail.tsx
│   │   ├── Procoursing.tsx
│   │   ├── SpeedRecords/      # Speed records pages
│   │   │   ├── index.tsx       # Speed records table (from SpeedRecords.tsx)
│   │   │   └── Stats.tsx       # Speed records stats (from SpeedRecordsStats.tsx)
│   │   └── TopDogs.tsx
│   ├── services/              # API client
│   │   └── api.ts
│   └── data/                  # Mock data
│       └── mockData.ts
├── public/
│   ├── _redirects             # SPA routing
│   └── assets/                # Static assets
├── package.json
├── vite.config.js
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
npm run load-events            # Load events to D1
npm run load-results           # Load results to D1
npm run reparse-bzmp           # Reparse BZMP events (legacy)
npm run reparse-coursing       # Reparse coursing events (legacy)
npm run reparse-racing         # Reparse racing events (legacy)
npm run reparse-2023           # Reparse all 2023 events
npm run reparse-2024           # Reparse all 2024 events
npm run reparse-2025           # Reparse all 2025 events
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
npm run test-parser            # Test parser
npm test                       # Run tests
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

### Использование remote D1

Для локальной разработки используется remote D1 (--remote флаг). Это гарантирует работу с актуальными данными.

---

## Testing

### Parser Testing

```bash
npx tsx backend/scripts/test/test-parser.ts
```

### CLI Mode

```bash
npx tsx backend/parsers/parse-results-coursing.ts <url>
npx tsx backend/parsers/parse-results-bzmp.ts <url>
npx tsx backend/parsers/parse-results-racing.ts <url>
```

### API Testing

```bash
npm test
```

**ВАЖНО:** Перед изменением парсера — прогони `npx tsx backend/scripts/test/test-parser.ts`

Текущий тест использует синтетические данные. ОБЯЗАТЕЛЬНО прогнать на 5-10 реальных страницах разных лет.

---

## Code Splitting

### Проблема

При сборке фронтенда появляется предупреждение:
```
dist/assets/index-B3yzHITO.js   652.47 kB │ gzip: 196.99 kB
(!) Some chunks are larger than 500 kB after minification
```

### Решения

**1. Code-splitting по страницам:**
```javascript
import { lazy, Suspense } from 'react'

const Judges = lazy(() => import('./pages/Judges/index'))
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'))
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'))
const SpeedRecordsStats = lazy(() => import('./pages/SpeedRecords/Stats'))
// и т.д.
```

**2. Настройка rollupOptions:**
```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-components': [...],
        'pages-judges': ['./pages/Judges', './pages/JudgeDetail'],
        'pages-speed': ['./pages/SpeedRecords', './pages/SpeedRecordsStats'],
      }
    }
  }
}
```

**3. Увеличение лимита:**
```javascript
// vite.config.js
build: {
  chunkSizeWarningLimit: 1000
}
```

---

## Мобильная адаптивность

### Обзор
Сайт полностью адаптирован для мобильных устройств с использованием TailwindCSS брейкпоинтов (`md:`).

### Реализация

**App.jsx:**
- Мобильная шапка с лого слева и кнопкой меню справа
- Контент на всю ширину экрана на мобильных
- Убран футер

**Страницы:**

**Events/index.jsx:**
- Карточки вместо таблицы на мобильных
- Фильтр по годам вынесен из "больше фильтров"
- Поиск и фильтры на разных строках на мобильных
- Легенда дисциплин скрыта на мобильных

**Judges/index.jsx:**
- Карточки с именем судьи и статистикой в grid 2x2 на мобильных

**SpeedRecords/index.jsx:**
- Карточки с кличкой, породой, полом, датой и скоростью на мобильных

**DogStatsTable.jsx (TopDogs):**
- Карточки с кличкой и статистикой в зависимости от типа (места/очки/скорость)
- Медали в карточках отображаются в одну строку (grid-cols-4)

**DogProfile.jsx:**
- Уменьшенные отступы и размеры на мобильных
- Стрелочка "←" скрыта на мобильных

**Procoursing.jsx:**
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
- API client: `frontend/src/services/api.js`
- Schema: `backend/schema.sql`
- Wrangler config: `wrangler.toml`

---

## См. также

- [data/PARSING.md](../data/PARSING.md) — Парсинг данных
- [data/DATABASE.md](../data/DATABASE.md) — Работа с БД
- [development/DEPLOYMENT.md](DEPLOYMENT.md) — Деплой и инфраструктура
- [architecture/API-REFERENCE.md](../architecture/API-REFERENCE.md) — Документация API
