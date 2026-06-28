# Development — Разработка

Документация по разработке ProCoursing Stats.

## File Structure

### Backend

```
backend/
├── src/
│   ├── worker.js              # Cloudflare Worker entry point (~93 строки)
│   └── routes/                # API endpoints
│       ├── admin.js           # Admin endpoints (import-results, delete-results, recreate-views)
│       ├── events.js           # Events & results (renamed from competitions.js)
│       ├── dogs.js            # Dog profiles
│       ├── judges.js          # Judges statistics
│       ├── speed.js           # Speed records
│       └── top.js             # Top ratings (placement, score, speed)
├── parsers/                   # Data parsers
│   ├── parse-results-coursing.mjs  # Coursing parser (~39 KB)
│   ├── parse-results-bzmp.mjs      # BZMP parser (~30 KB)
│   └── parse-results-racing.mjs    # Racing parser (~14 KB)
├── scripts/                   # Data loading scripts (organized by folders)
│   ├── scrape/                # Scraping scripts
│   │   └── scrape-year-index.mjs
│   ├── load/                  # Load scripts
│   │   ├── load-events.mjs
│   │   └── load-results.mjs
│   ├── reparse/               # Reparse scripts (after parser changes)
│   │   ├── reparse-bzmp-events.mjs
│   │   ├── reparse-coursing-events.mjs
│   │   └── reparse-racing-events.mjs
│   ├── migrate/               # Migration scripts
│   │   └── migrate-normalize-dog-names.mjs
│   ├── sync/                  # Sync scripts (local ↔ remote)
│   │   └── sync-local-to-remote.mjs
│   ├── update/                # Update scripts
│   │   ├── update-current-year.mjs
│   │   └── merge-dogs.mjs
│   ├── speed/                 # Speed records scripts
│   │   ├── fetch-speed-records.mjs
│   │   └── fetch-speed-records-pdf.py
│   ├── test/                  # Test scripts
│   │   └── test-parser.mjs
│   ├── ci/                    # CI/CD scripts (GitHub Actions)
│   │   └── ci-update-db.mjs
│   └── archive/               # One-time scripts (DO NOT REUSE)
├── lib/                       # Common modules
│   ├── fetch-win1251.mjs      # Windows-1251 decoding
│   └── dog-lookup.mjs         # Dog name normalization
├── schema.sql                 # Database schema
└── tests/                     # Tests
    └── api.test.mjs
```

### Frontend

```
frontend/
├── src/
│   ├── App.jsx                # Main component with navigation
│   ├── main.jsx               # Entry point
│   ├── constants.js           # Constants (colors, statuses)
│   ├── components/            # React components
│   │   ├── DogSilhouettes.jsx
│   │   ├── DogStatsTable.jsx
│   │   ├── DogTooltip.jsx
│   │   ├── FilterSelect.jsx
│   │   └── FiltersDropdown.jsx
│   ├── pages/                 # React pages
│   │   ├── DogProfile.jsx
│   │   ├── Events/            # Events pages
│   │   │   ├── index.jsx       # Events list (from Events.jsx)
│   │   │   └── EventResults.jsx
│   │   ├── Judges/            # Judges pages
│   │   │   ├── index.jsx       # Judges list (from Judges.jsx)
│   │   │   └── JudgeDetail.jsx
│   │   ├── Procoursing.jsx
│   │   ├── SpeedRecords/      # Speed records pages
│   │   │   ├── index.jsx       # Speed records table (from SpeedRecords.jsx)
│   │   │   └── Stats.jsx       # Speed records stats (from SpeedRecordsStats.jsx)
│   │   └── TopDogs.jsx
│   ├── services/              # API client
│   │   └── api.js
│   └── data/                  # Mock data
│       └── mockData.js
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
node backend/scripts/test/test-parser.mjs
```

### CLI Mode

```bash
node backend/parsers/parse-results-coursing.mjs <url>
node backend/parsers/parse-results-bzmp.mjs <url>
node backend/parsers/parse-results-racing.mjs <url>
```

### API Testing

```bash
npm test
```

**ВАЖНО:** Перед изменением парсера — прогони `node backend/scripts/test/test-parser.mjs`

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

- [05-PARSING.md](05-PARSING.md) — Парсинг данных
- [06-DATABASE.md](06-DATABASE.md) — Работа с БД
- [07-DEPLOYMENT.md](07-DEPLOYMENT.md) — Деплой и инфраструктура
- [04-API-REFERENCE.md](04-API-REFERENCE.md) — Документация API
