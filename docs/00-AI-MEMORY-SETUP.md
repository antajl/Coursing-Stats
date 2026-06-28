# AI Memory Setup — Настройка памяти ИИ-агента

Этот документ содержит инструкции для ИИ-агента по настройке памяти при первом анализе проекта ProCoursing Stats.

**Инструкция для пользователя:** Когда начинаете работу с новым ИИ-агентом, скажите: "Проанализируй наш проект, начиная с папки docs. Сначала прочитай `docs/00-AI-MEMORY-SETUP.md` и добавь указанные memories."

---

## Обязательные Memories (Critical)

### 1. Структура проекта

**ID:** `project-structure`
**Title:** Структура проекта ProCoursing Stats
**Content:**
```
backend/src/worker.js — тонкий диспетчер (~93 строки), делегирует в routes/
backend/src/routes/ — модули API (admin.js, events.js, dogs.js, judges.js, speed.js, top.js)
backend/parsers/ — парсеры для coursing, BZMP, racing
backend/scripts/ — скрипты загрузки данных (организованы по папкам: scrape/, load/, reparse/, migrate/, sync/, update/, speed/, test/, ci/)
backend/scripts/archive/ — одноразовые скрипты (НЕ ПЕРЕИСПОЛЬЗОВАТЬ)
backend/lib/ — общие модули (fetch-win1251.mjs, dog-lookup.mjs)
frontend/src/ — React приложение (pages организованы по папкам: Events/, Judges/, SpeedRecords/, components, services)
data/ — данные (организованы по папкам: events/, migrations/, exports/, imports/, updates/, temp/)
docs/ — документация (README.md, 00-AI-MEMORY-SETUP.md, 00-PROJECT-MIGRATION-PLAN.md, 01-10.md, archive/)
scripts/ — batch/shell скрипты (start-local.bat, push-github.bat)
assets/ — статические ассеты (logo.svg)
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
Frontend: React, Vite, TailwindCSS, shadcn/ui, Lucide, xlsx
Деплой: Cloudflare Pages (фронтенд), Cloudflare Workers (бэкенд), Cloudflare D1 (БД)
Домены: procoursing.antajl.ru (фронтенд), api.procoursing.antajl.ru (API)
GitHub: https://github.com/antajl/ProCoursing
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
- events: 302
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
- Пример в backend/lib/fetch-win1251.mjs

Правила турниров курсинга:
- Количество судей: 1, 2 или 3 (чаще 2)
- Категории оценок (каждая 0-20): Маневренность, Резвость, Выносливость, Преследование, Энтузиазм
- Максимальная оценка: 1 судья=200, 2 судьи=400, 3 судьи=600
- Нормализация total_score: НЕ делить на количество судей, сохраняется исходная grand_total (изменено в 2026)

Перед изменением парсера — прогони node backend/scripts/test/test-parser.mjs

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
docs/README.md — оглавление с кратким обзором
docs/01-QUICK-START.md — быстрый старт для новых разработчиков
docs/02-AI-GUIDELINES.md — правила для ИИ-агента
docs/03-ARCHITECTURE.md — архитектура системы
docs/04-API-REFERENCE.md — документация API
docs/05-PARSING.md — парсинг данных
docs/06-DATABASE.md — работа с БД
docs/07-DEPLOYMENT.md — деплой и инфраструктура
docs/08-DEVELOPMENT.md — разработка
docs/09-DECISIONS-LOG.md — история архитектурных решений
docs/10-FUTURE-PLANS.md — планы на будущее
docs/archive/ — устаревшая документация
```
**Tags:** documentation, structure
**Priority:** Important

---

### 7. Парсеры и их особенности

**ID:** `parsers-details`
**Title:** Парсеры и их особенности
**Content:**
```
backend/parsers/parse-results-coursing.mjs — парсер курсинга (~39 KB)
backend/parsers/parse-results-bzmp.mjs — парсер БЗМП (~30 KB)
backend/parsers/parse-results-racing.mjs — парсер рейсинга (~14 KB)

Особенности:
- Coursing: 25 колонок, rowspan=2, судейские оценки, 2 забега
- BZMP: 25 колонок, rowspan=2, судейские оценки, 2 забега, статусы "Отстранение"
- Racing: 18 колонок, нет rowspan, время/скорость, до 3 забегов

Тестовый скрипт: backend/scripts/test/test-parser.mjs (использует синтетические данные, ОБЯЗАТЕЛЬНО прогнать на 5-10 реальных страницах разных лет)
```
**Tags:** parsing, details
**Priority:** Important

---

### 8. API Routes

**ID:** `api-routes`
**Title:** API Routes
**Content:**
```
backend/src/routes/admin.js — admin endpoints с авторизацией
backend/src/routes/events.js — события и результаты (переименован из competitions.js)
backend/src/routes/dogs.js — профили собак
backend/src/routes/judges.js — статистика судей
backend/src/routes/speed.js — рекорды скорости
backend/src/routes/top.js — рейтинги собак

Base URL:
- Production: https://api.procoursing.antajl.ru
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
npm test — запуск тестов
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
frontend/src/components/DogSilhouettes.jsx — SVG силуэты пород
frontend/src/components/DogStatsTable.jsx — таблица статистики (~12 KB)
frontend/src/components/DogTooltip.jsx — tooltip с информацией (~15 KB)
frontend/src/components/FilterSelect.jsx — селектор фильтров
frontend/src/components/FiltersDropdown.jsx — dropdown фильтров
```
**Tags:** frontend, components
**Priority:** Optional

---

### 12. Frontend Pages

**ID:** `frontend-pages`
**Title:** Frontend Pages
**Content:**
```
frontend/src/pages/DogProfile.jsx — профиль собаки (~15 KB)
frontend/src/pages/EventResults.jsx — результаты события (~26 KB)
frontend/src/pages/Events.jsx — календарь событий (~19 KB)
frontend/src/pages/JudgeDetail.jsx — детальная страница судьи (~21 KB)
frontend/src/pages/Judges.jsx — список судей (~10 KB)
frontend/src/pages/Procoursing.jsx — навигация Procoursing (~2 KB)
frontend/src/pages/SpeedRecords.jsx — рекорды Донино (~26 KB)
frontend/src/pages/SpeedRecordsStats.jsx — статистика рекордов (~21 KB)
frontend/src/pages/TopDogs.jsx — рейтинги собак (~19 KB)
```
**Tags:** frontend, pages
**Priority:** Optional

---

## Инструкция для ИИ-агента

При первом анализе проекта:

1. **Прочитай этот файл** (`docs/00-AI-MEMORY-SETUP.md`)
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

**Дата последнего обновления:** 2026-06-27
