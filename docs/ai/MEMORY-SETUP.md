# AI Memory Setup — Настройка памяти ИИ-агента

Этот документ содержит инструкции для ИИ-агента по настройке памяти при первом анализе проекта Coursing Stats.

**Инструкция для пользователя:** Когда начинаете работу с новым ИИ-агентом, скажите: "Проанализируй наш проект, начиная с папки docs. Сначала прочитай `docs/ai/MEMORY-SETUP.md` и добавь указанные memories."

---

## Обязательные Memories (Critical)

### 1. Структура проекта

**ID:** `project-structure`
**Title:** Структура проекта Coursing Stats
**Content:**
```
backend/src/worker.ts — 8-строчная обёртка, делегирует в app.ts (Hono application)
backend/src/routes/ — модули API (admin.ts, events.ts, dogs.ts, judges.ts, speed.ts, top.ts)
backend/parsers/ — v1: parse-results-*.ts (reparse); v2 модульные: coursing/, bzmp/, racing/, unique/ (целевые)
backend/tests/fixtures/ — реальные HTML фикстуры для парсеров
backend/scripts/test/ — test-parser.ts, test-parsers-fixtures.ts, download-fixtures.ts, smoke-api.ts, compare-parsers.ts
backend/scripts/archive/ — одноразовые скрипты (НЕ ПЕРЕИСПОЛЬЗОВАТЬ)
backend/lib/ — общие модули (fetch-win1251.ts, dog-lookup.ts)
frontend/src/App.tsx — shell; AppRoutes.tsx — lazy routes; Nav.tsx — шапка (.nav-glass, центр ссылок)
frontend/src/lib/recordDates.ts — даты Донино (Excel serial, DD.MM.YYYY, dedupeByRecordDate)
frontend/src/components/ui/ — кастомные UI (Button, Card, Badge), НЕ shadcn
frontend/src/pages/Home.tsx — лендинг (WIP)
data/ — данные (организованы по папкам: events/, migrations/, exports/, imports/, updates/, temp/)
docs/ — документация: README.md, 00-PROJECT-STATUS.md, 01-QUICK-START.md, ai/, architecture/, data/, development/ (вкл. FRONTEND-MAP.md), design/, history/, plans/
Все скрипты .ts, запуск через npx tsx. Файлов .mjs нет.
package-lock.json в репозитории (для npm ci в CI).
scripts/ — batch/shell скрипты (start-servers.bat, deploy-to-github.bat)
assets/ — статические ассеты (assets/logo.svg)
```
**Tags:** structure, files, organization
**Priority:** Critical

---

### 2. Зафиксированные архитектурные решения

**ID:** `fixed-architectural-decisions`
**Title:** Зафиксированные архитектурные решения
**Content:**
```
НЕ МЕНЯТЬ БЕЗ ЯВНОГО ЗАПРОСА:
- Охват: все породы (с фильтром в UI), весь архив 2015–2026 (с фильтром по году)
- Топ — ДВА отдельных рейтинга: по местам (медальный зачёт) и по очкам (лучший результат + средний + число стартов)
- Родословные — переход на внешний сайт по клику, не храним и не парсим PDF-каталоги
- Стек: Cloudflare Pages + Worker + D1
- Бэкафилл истории — разовый Node-скрипт локально, текущий год — инкремент по GitHub Actions
- Нормализация total_score: НЕ делить на количество судей, сохраняется исходная grand_total (изменено в 2026)
```
**Tags:** architecture, decisions, fixed_rules
**Priority:** Critical

---

### 3. Технический стек и деплой

**ID:** `tech-stack-deployment`
**Title:** Технический стек и деплой
**Content:**
```
Backend: Cloudflare Worker (API), Cloudflare D1 (SQLite), Node.js (скраперы/парсеры)
Frontend: React, Vite, TailwindCSS, кастомные components/ui/ (без shadcn), Lucide, xlsx
Деплой: Cloudflare Pages (фронтенд), Cloudflare Workers (бэкенд), Cloudflare D1 (БД)
Домены: coursing-stats.ru (фронтенд), api.coursing-stats.ru (API)
GitHub: https://github.com/antajl/Coursing-Stats
Автоматизация: GitHub Actions (обновление D1 каждый понедельник, деплой при push в main)
```
**Tags:** tech_stack, deployment, infrastructure
**Priority:** Critical

---

### 4. Данные и статистика БД

**ID:** `database-statistics`
**Title:** Состояние базы данных D1
**Content:**
```
База данных D1 (local и remote синхронизированы 2026-06-26):
- events: 219
- dogs: ~1579
- results: 4639
- speed_records: данные из Google Sheets (автообновление)
- Remote D1: ~21 MB

Распределение по годам:
- 2023: 771 результатов (22 события)
- 2024: 1086 результатов (27 событий)
- 2025: 1971 результатов (50 событий)
- 2026: 811 результатов (16 событий)
- 2015-2022: НЕДОСТУПНЫ (хранятся как изображения, требуется OCR)

HTML формат по годам:
- 2015-2022: Results stored as images (JPG) - NOT parseable without OCR
- 2023-2024: Simplified HTML tables (23 cells), catalog numbers as plain text
- 2025-2026: Detailed HTML tables (25 cells), catalog numbers in <i> tags
```
**Tags:** data, database, statistics
**Priority:** Critical

---

### 5. Критически важное: кодировка и парсинг

**ID:** `critical-encoding-parsing`
**Title:** Критически важное: кодировка и правила парсинга
**Content:**
```
КРИТИЧЕСКИ ВАЖНО: Сайт procoursing.ru использует windows-1251 без charset в заголовках.
- Использовать iconv-lite для декодирования
- НЕ доверять fetch().text() — декодировать из байт вручную
- Пример в backend/lib/fetch-win1251.ts

Правила турниров курсинга:
- Количество судей: 1, 2 или 3 (чаще 2)
- Категории оценок (каждая 0-20): Маневренность, Резвость, Выносливость, Преследование, Энтузиазм
- Максимальная оценка: 1 судья=200, 2 судьи=400, 3 судьи=600
- Нормализация total_score: НЕ делить на количество судей, сохраняется исходная grand_total (изменено в 2026)

Перед изменением парсера — прогони npx tsx backend/scripts/test/test-parser.ts

БЗМП и бега (Racing) — отдельные форматы страниц, парсер для них уже написан. Не предполагать что формат курсинга подойдёт.

Сохранять raw_text всегда при парсинге — страховка от потери данных.
```
**Tags:** development, encoding, parsing, cautions, risks
**Priority:** Critical

---

## Желательные Memories (Important)

### 6. Документация проекта

**ID:** `documentation-structure`
**Title:** Структура документации
**Content:**
```
docs/README.md — оглавление
docs/00-PROJECT-STATUS.md — актуальный статус (читать первым)
docs/01-QUICK-START.md — быстрый старт
docs/ai/GUIDELINES.md — правила для ИИ
docs/ai/MEMORY-SETUP.md — этот файл
docs/architecture/ARCHITECTURE.md — архитектура
docs/architecture/API-REFERENCE.md — API
docs/data/PARSING.md — парсинг
docs/data/DATABASE.md — БД
docs/development/DEVELOPMENT.md — разработка
docs/development/FRONTEND-MAP.md — навигация фронтенда для ИИ
docs/development/DEPLOYMENT.md — деплой
docs/plans/FUTURE-PLANS.md — планы
docs/history/DECISIONS-LOG.md — история решений
```
**Tags:** documentation, structure
**Priority:** Important

---

### 7. Парсеры и их особенности

**ID:** `parsers-details`
**Title:** Парсеры и их особенности
**Content:**
```
backend/parsers/parse-results-coursing.ts — v1, reparse (~39 KB)
backend/parsers/parse-results-bzmp.ts — v1, reparse (~30 KB)
backend/parsers/parse-results-racing.ts — v1, reparse (~14 KB)
backend/parsers/coursing/index.ts — v2 модульный (целевой)
backend/parsers/bzmp/index.ts — v2 модульный
backend/parsers/racing/index.ts — v2 модульный
backend/parsers/unique/ — общие утилиты v2

Фикстуры: backend/tests/fixtures/{coursing,bzmp,racing}/
Тесты: npm run test-parser (синтетика v1), npm run test-parser-fixtures (v2 на фикстурах)
```
**Tags:** parsing, details
**Priority:** Important

---

### 8. API Routes

**ID:** `api-routes`
**Title:** API Routes
**Content:**
```
backend/src/routes/admin.ts — admin endpoints с авторизацией
backend/src/routes/events.ts — события и результаты (переименован из competitions.ts)
backend/src/routes/dogs.ts — профили собак
backend/src/routes/judges.ts — статистика судей
backend/src/routes/speed.ts — рекорды скорости
backend/src/routes/top.ts — рейтинги собак

Base URL:
- Production: https://api.coursing-stats.ru
- Development: http://127.0.0.1:8787
```
**Tags:** api, routes
**Priority:** Important

---

### 9. NPM Scripts

**ID:** `npm-scripts`
**Title:** NPM Scripts
**Content:**
```
npm run dev — запуск обоих серверов (Worker + Vite)
npm run scrape-index — скрапинг индекса событий
npm run load-events — загрузка событий в D1
npm run load-results — загрузка результатов в D1
npm run ci-update-db — инкремент текущего года → remote D1
npm run sync-to-remote — полный синк локальной D1 → remote
npm run migrate-dog-names — нормализация кличек в локальной D1
npm run test-parser — синтетические тесты парсеров v1
npm run test-parser-fixtures — v2 модульные парсеры на реальных фикстурах
npm run download-fixtures — загрузка HTML фикстур с procoursing.ru
npm run smoke-api — ручная проверка API (нужен npm run dev)
npm test — vitest (api.test.ts сейчас describe.skip; планируется vitest@4 + @cloudflare/vitest-pool-workers)
```
**Tags:** scripts, npm
**Priority:** Important

---

### 10. GitHub Actions

**ID:** `github-actions`
**Title:** GitHub Actions Workflows
**Content:**
```
.github/workflows/deploy-frontend.yml — деплой фронтенда на Cloudflare Pages
.github/workflows/update-db.yml — обновление D1 (каждый понедельник 02:00 UTC)
.github/workflows/update-speed-records.yml — обновление рекордов скорости (каждый день 03:00 UTC)

Secrets:
- CLOUDFLARE_API_TOKEN — API токен Cloudflare
- CLOUDFLARE_ACCOUNT_ID — ID аккаунта Cloudflare
```
**Tags:** automation, github, actions
**Priority:** Important

---

## Опциональные Memories (Nice to have)

### 11. Frontend Components

**ID:** `frontend-components`
**Title:** Frontend Components
**Content:**
```
frontend/src/components/DogSilhouettes.tsx — SVG силуэты пород
frontend/src/components/DogStatsTable.tsx — таблица рейтинга (медали в заголовках колонок)
frontend/src/components/DogTooltip.tsx — tooltip с информацией
frontend/src/components/EmptyState.tsx — компонент пустого состояния
frontend/src/components/ErrorState.tsx — компонент ошибки
frontend/src/components/FilterSelect.tsx — селектор фильтров (allLabel + ariaLabel, без compactLabel)
frontend/src/components/FiltersDropdown.tsx — dropdown фильтров
frontend/src/components/Nav.tsx — .nav-glass, лого слева / ссылки по центру / тема справа
frontend/src/components/SkeletonLoader.tsx — скелетон загрузки
frontend/src/components/ThemeToggle.tsx — переключатель темы; по умолчанию light (localStorage.theme)
```
**Tags:** frontend, components
**Priority:** Optional

---

### 12. Frontend Pages

**ID:** `frontend-pages`
**Title:** Frontend Pages
**Content:**
```
frontend/src/pages/DogProfile.tsx — профиль собаки
frontend/src/pages/DoninoDogProfile.tsx — профиль собаки Донино со статистикой скорости
frontend/src/pages/Events/EventResults/ — результаты события (index с navigate(-1), EventHeader, PlacementBadge)
frontend/src/pages/Events/index.tsx — календарь событий
frontend/src/pages/Judges/JudgeDetail.tsx — детальная страница судьи
frontend/src/pages/Judges/index.tsx — список судей
frontend/src/pages/Competitions.tsx — навигация Coursing Stats
frontend/src/pages/SpeedRecords/ — рекорды Донино (Stats limit 10000; таблица limit 1000)
frontend/src/pages/TopDogs/ — рейтинги собак (index, TopDogsFilters, TopDogsTabs)
```
**Tags:** frontend, pages
**Priority:** Optional

---

## Инструкция для ИИ-агента

При первом анализе проекта:

1. **Прочитай этот файл** (`docs/ai/MEMORY-SETUP.md`)
2. **Создай memories** в порядке приоритета:
   - Сначала Critical (1-5)
   - Потом Important (6-10)
   - Потом Optional (11-12)
3. **Используй create_memory tool** для каждой memory
4. **Установи UserTriggered: false** для всех memories (это автоматические memories)
5. **Используй указанные теги** для каждой memory
6. **После создания memories**, продолжай анализ проекта

**Примечание:** Если какая-то memory уже существует (проверяй по ID), обнови её вместо создания новой.

---

## Проверка

После создания memories, проверь что:

- [ ] Все Critical memories созданы (1-5)
- [ ] Все Important memories созданы (6-10)
- [ ] Optional memories созданы (11-12)
- [ ] Все memories имеют правильные теги
- [ ] Все memories имеют UserTriggered: false
- [ ] Content соответствует этому документу

---

## Обновление этого документа

Если добавляются новые критически важные правила или меняется структура проекта, обнови этот документ и соответствующие memories.

**Дата последнего обновления:** 2026-07-03
