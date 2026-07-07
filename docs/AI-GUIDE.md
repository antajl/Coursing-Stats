# AI Guide — Руководство для ИИ-агента

Этот документ содержит инструкции и правила для ИИ-агента при работе с проектом Coursing Stats.

**Инструкция для пользователя:** Когда начинаете работу с новым ИИ-агентом, скажите: «Проанализируй проект, начни с `docs/`. Прочитай `docs/AI-GUIDE.md` и используй `.cursor/rules/` + skills.»

---

## Инструкция для пользователя

При работе с новым ИИ-агентом:

1. Попросите прочитать `docs/GETTING-STARTED.md` и этот файл
2. Контекст проекта уже в **`.cursor/rules/`** (alwaysApply + globs для парсеров и фронта)
3. Skills: `.cursor/skills/coursing-stats-dev/`, `.cursor/skills/coursing-stats-parsers/`
4. Разделы **Memories** ниже — справочник; при расхождении приоритет у `GETTING-STARTED.md` и `CHANGELOG.md`

**Примечание:** Секция Memories обновляется вместе с правилами и skills при значимых изменениях проекта.

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
frontend/src/lib/recordDates.ts — даты Донино (Excel serial, DD.MM.YYYY, dedupeByRecordDate, expandCoursingTimeline)
frontend/src/lib/ownerMarks.ts — личные метки-короны у кличек (Easter egg, без связи в БД)
frontend/src/lib/toolbar.ts — классы PageToolbar / сегментов / чипов сортировки
frontend/src/components/toolbar/ — PageToolbar, ToolbarSegmentControl, RecordsListToolbar, MultiFilterDropdown, …
frontend/src/components/OwnerCrownName.tsx — обёртка имени с короной для owner marks
frontend/src/pages/Home.tsx — лендинг: hero, stats strip, подиум, Донино
data/ — данные (организованы по папкам: events/, migrations/, exports/, imports/, updates/, temp/)
docs/ — документация: README.md, GETTING-STARTED.md, ARCHITECTURE.md, API-REFERENCE.md, PARSING.md, DATABASE.md, SPEED-RECORDS.md, DESIGN-SYSTEM.md, DEVELOPMENT.md, DECISIONS-LOG.md, FUTURE-PLANS.md, AI-GUIDE.md
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

ОБЯЗАТЕЛЬНО ПРИ СОЗДАНИИ НОВЫХ СТРАНИЦ:
- Добавить SEO meta-теги через компонент `SEO` из `frontend/src/components/SEO.tsx`
- Обернуть return в JSX фрагмент и добавить `<SEO title="..." description="..." keywords="..." />`
- Добавить страницу в динамический sitemap в `backend/src/routes/sitemap.ts`
- Подробности в `docs/SEO.md`
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
Автоматизация: GitHub Actions (обновление D1 4×/день — 05:00, 11:00, 17:00, 20:30 UTC; деплой при push в main)
```
**Tags:** tech_stack, deployment, infrastructure
**Priority:** Critical

---

### 4. Данные и статистика БД

**ID:** `database-statistics`
**Title:** Состояние базы данных D1
**Content:**
```
База данных D1 (local и remote синхронизированы):
- events: 225 (2015–2026, календарь)
- dogs: 1628
- results: 2966 (только 2025–2026)
- speed_records: 213 (Google Sheets, автообновление)
- coursing_records: 107 (Google Sheets 350 м, автообновление)
- Remote D1: ~21 MB

Распределение results:
- 2025: 2114 (50 событий)
- 2026: 852 (51 событие)
- 2015–2024: НЕДОСТУПНЫ как HTML (хранятся как изображения, требуется OCR)

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
docs/GETTING-STARTED.md — быстрый старт + статус проекта
docs/ARCHITECTURE.md — архитектура + бренд/инфраструктура
docs/API-REFERENCE.md — API
docs/PARSING.md — парсинг
docs/DATABASE.md — БД
docs/SPEED-RECORDS.md — рекорды Донино
docs/DESIGN-SYSTEM.md — дизайн-система
docs/DEVELOPMENT.md — разработка
docs/FUTURE-PLANS.md — планы
docs/DECISIONS-LOG.md — история решений
docs/DATA-ARCHIVE.md — файловый архив и будущая схема v1
docs/GUIDE.md — справочник `/guide`
docs/AI-GUIDE.md — этот файл
docs/TESTING.md — unit, E2E (Playwright), фикстуры
docs/_archive/cursor-ui-plan-v2.md — план UI-аудита v2 (архив, статус задач)
docs/_archive/FUTURE-PLANS-COMPLETED.md — выполненные пункты из FUTURE-PLANS
```
**Tags:** documentation, structure
**Priority:** Important

---

### 7. Парсеры и их особенности

**ID:** `parsers-details`
**Title:** Парсеры и их особенности
**Content:**
```
backend/parsers/parse-results-coursing.ts — v1, reparse)
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
backend/src/routes/events.ts — события и результаты; публичный путь /api/competitions (не /api/events)
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
npm run dev — Worker + Vite (локальная D1)
npm run dev:remote — Worker + Vite (remote D1, жрёт квоту reads)
npm run sync-from-remote — remote D1 → локальная копия
npm run export-archive — полный файловый архив → data/archive/snapshots/
npm run generate-favicon — favicon.ico из favicon.svg
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
npm run test:e2e — Playwright E2E (поднимает dev-сервер)
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
.github/workflows/update-db.yml — обновление D1 (4×/день: 05:00, 11:00, 17:00, 20:30 UTC)
.github/workflows/update-speed-records.yml — обновление рекордов скорости (4 раза в день: 08:00, 14:00, 20:00, 23:30 МСК)

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
frontend/src/components/FilterSelect.tsx — селектор фильтров; `className` на обёртке, `selectClassName` опционально; не дублировать layout-классы на `<select>`
frontend/src/components/toolbar/PageToolbar.tsx — панель фильтров + сегменты + активные чипы
frontend/src/components/OwnerCrownName.tsx — корона слева от имени (owner marks)
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
frontend/src/pages/DogProfile.tsx — профиль собаки соревнований; блоки Донино; шапка с титулами-чипами
frontend/src/pages/DoninoDogProfile.tsx — профиль Донино (warm-blue / forest), история через expandCoursingTimeline
frontend/src/pages/Home.tsx — главная: hero-dashboard, топ сезона, рекорды Донино
frontend/src/pages/Events/EventResults/ — результаты события (index с navigate(-1), EventHeader, PlacementBadge)
frontend/src/pages/Competitions.tsx — hub: Календарь / Рейтинг / Судьи (`ToolbarSegmentControl`); вкладки монтируются по выбору (статический import)
frontend/src/pages/Events/index.tsx — календарь: PageToolbar, EventListRow, URL sync с сохранением `?tab=`
frontend/src/pages/SpeedRecords/ — Donino hub: DoninoPageToolbar, DoninoRecordsColumns, DoninoStatsColumns; ?view=stats, ?groupBy=
frontend/src/pages/TopDogs/ — рейтинги собак (index, TopDogsFilters, TopDogsTabs)
```
**Tags:** frontend, pages
**Priority:** Optional

---

## Общие правила

1. **Всегда читай GETTING-STARTED.md первым** — там полный контекст проекта
2. **Перед изменением парсера — прогони тесты** — `npm run test-parser` и `npm run test-parser-fixtures` должны быть зелёными
3. **Не трогай зафиксированные решения** — два отдельных топа, все породы, весь архив, родословные на внешний сайт
4. **Сохраняй raw_text всегда** — это страховка от потери данных при ошибках парсинга
5. **Серверы МОЖНО запускать** — это разрешено и рекомендуется для разработки
6. **НЕ используй слово "events" в API путях** — uBlock и другие adblockers блокируют запросы с этим словом (похоже на трекинг аналитики). Используй "competitions" вместо "events".

## Зафиксированные решения (не предлагать пересмотреть без явного запроса)

- Охват: все породы (с фильтром в UI), весь архив 2015–2026 (с фильтром по году, по умолчанию открыт текущий год)
- Топ — ДВА отдельных рейтинга, не один: по местам (медальный зачёт: золото→серебро→бронза) и по очкам (лучший результат + средний + число стартов рядом). Не сводить в одну формулу
- Родословные — переход на внешний сайт по клику, мы их сами не храним и не парсим PDF-каталоги
- Стек: Cloudflare Pages + Worker + D1
- Бэкафилл истории — разовый Node-скрипт локально, текущий год — инкремент по Cron Trigger
- **Нормализация total_score:** НЕ делить на количество судей, сохраняется исходная grand_total. Сырая сумма используется напрямую (1=200 max, 2=400 max, 3=600 max)

## Правила турниров (курсинг)

**Количество судей:** 1, 2 или 3 судьи (чаще всего 2 судьи)

**Определение количества судей:**
- Приоритет: текст судей (judgesText) над структурой таблицы
- Формат "Главный судья - Иванова Г.С." без "судья -" → 1 судья
- Формат "Главный судья - Иванова Г.С., судья - Петрова А.А." → 2 судьи
- Поддержка инициалов: Н.В., Г.С., Д.М. и т.д.
- Отдельные функции парсинга для разного количества судей (parseDogRow1Judge, parseDogRow2Judges, parseDogRow3Judges)

**Категории оценок (каждая от 0 до 20):**
- Маневренность (М)
- Резвость (Р)
- Выносливость (В)
- Преследование (П)
- Энтузиазм (Э)

**Максимальная оценка:**
- 1 судья: 200 баллов (5 категорий × 20)
- 2 судьи: 400 баллов (5 категорий × 20 × 2)
- 3 судьи: 600 баллов (5 категорий × 20 × 3)

**Нормализация:** total_score сохраняется как исходная grand_total без деления на количество судей.

**Извлечение номера забега:**
- Жесткая привязка к цвету: если в ячейке есть цвет (bgcolor), то содержимое ячейки — это номер забега
- Это особенно важно для disqualified собак, где номер забега может быть единственным идентификатором

**Обработка дисквалификаций:**
- Проверка colspan в ячейках (colspan >= 6 → disqualified)
- Сохранение причины дисквалификации
- Сохранение номера забега и цвета попоны даже при дисквалификации

**Высшая квалификация (ВС):**
- Колонка ВС в протоколах соревнований
- Собака получает знак "+" если набрала достаточно баллов для присвоения высшей квалификации
- Это официальный статус РКФ, влияет на титулы (Чемпион РКФ, RegCACL и т.д.)
- Сохраняется в results.vc как "+" или пустая строка

**Статусы участников:**
- **Получил оценки** — финишировал, имеет оценки судей
- **Дисквалифицирован** — отстранен от участия (по решению судей, ветеринара или владельца). Важно: могут быть оценки за предыдущие забеги в том же соревновании
- **Не участвовал** — неявка (не явился, не прибыл)

## Запуск серверов

### Локальная разработка
```bash
# Первый раз или раз в неделю — свежие prod-данные
npm run sync-from-remote

# Оба сервера (рекомендуется, локальная D1)
npm run dev
# Worker :8787 + Vite :5173

# Prod-данные напрямую (осторожно — квота D1 reads)
npm run dev:remote

# Или вручную:
npx wrangler dev backend/src/worker.ts --port 8787
cd frontend && npm run dev
```

**Тема UI:** по умолчанию светлая (`index.html` + `ThemeToggle`); тёмная только при `localStorage.theme === 'dark'`.

**ВАЖНО:** Серверы МОЖНО и НУЖНО запускать командами. Это разрешено для разработки и тестирования.

## Работа с кодировкой

⚠️ **Критически важно:** Сайт procoursing.ru использует windows-1251 без charset в заголовках.

- Используй `iconv-lite` для декодирования
- НЕ доверяй `fetch().text()` — декодируй из байт вручную
- Пример в `backend/lib/fetch-win1251.ts`

## Тестирование парсеров

1. **Синтетические тесты (v1):** `npm run test-parser`
2. **Фикстуры (v2 модульные):** `npm run test-parser-fixtures`
3. **Реальные URL:** Прогони на 5-10 страницах разных лет при крупных изменениях
3. **Проверяй:**
   - Каталожные номера
   - Клички (рус/лат)
   - Баллы судей
   - Итоги
   - Титулы
   - Статусы (снят, дисквалифицирован, не финишировал)

## Разбивка больших файлов

Если файл превышает 2000 строк:

1. **Вынеси константы** в отдельный файл `constants.ts`
2. **Вынеси утилиты** в `lib/utils.ts`
3. **Разбей по функциональности:**
   - Парсеры: `parse-results-coursing.ts`, `parse-results-bzmp.ts`, `parse-results-racing.ts`
   - Скраперы: `scrape-year-index.ts`, `scrape-event-details.ts`
   - Загрузчики: `load-to-d1.ts`

## Вежливость к сайту-источнику

- Добавляй паузу между запросами (функция `sleep()` в `backend/lib/fetch-win1251.ts`)
- Не делай параллельные запросы при бэкафилле
- Проверь `robots.txt` сайта

## Работа с памятью

Создавай воспоминания для:
- Зафиксированных архитектурных решений
- Открытых вопросов и рисков
- Важных паттернов кода
- Изменений в структуре сайта

## Порядок работы

1. Прочитай `docs/GETTING-STARTED.md` и этот файл
2. Проверь актуальность других docs файлов
3. Перед изменением — прогони тесты
4. После изменения — обнови документацию
5. Создай/обнови воспоминания для важных решений

## Известные риски / куда смотреть внимательно

- Сайт-источник в кодировке windows-1251, без явного charset в заголовках. Скрапер ОБЯЗАН декодировать вручную (`backend/lib/fetch-win1251.ts`, iconv-lite), иначе кириллица теряется безвозвратно
- `scripts/scrape/scrape-year-index.ts` — написан по структуре, которую я видел через инструмент с битой кодировкой (но точными URL). Структура таблицы (порядок td) — best guess, проверь на реальном HTML первым делом
- `backend/parsers/parse-results-coursing.ts` — есть рабочий тест (`npm run test-parser` синтетика + `npm run test-parser-fixtures` на реальных HTML в `backend/tests/fixtures/`)
- БЗМП и бега (Racing) — отдельные форматы страниц, парсер для них уже написан. Не предполагай, что формат курсинга подойдёт

## Рабочий процесс

1. Перед любым изменением парсера — `npm run test-parser` и `npm run test-parser-fixtures`. После изменения — снова; тесты должны остаться зелёными (или обнови ожидания с объяснением)
2. Не трогай зафиксированные решения выше без явного запроса
3. При парсинге реальных страниц — сохраняй `raw_text` всегда, даже когда уверен в разборе. Это страховка от тихой потери данных
4. Будь вежлив к сайту-источнику: пауза между запросами (уже есть в `backend/lib/fetch-win1251.ts` / `sleep()`), не параллелить запросы при бэкафилле

---

## Проверка

После обновления контекста агента:

- [ ] `.cursor/rules/coursing-stats-core.mdc` — актуальные цифры БД и ограничения
- [ ] `.cursor/rules/coursing-stats-parsers.mdc` и `coursing-stats-frontend.mdc` — без устаревших путей
- [ ] Skills `coursing-stats-dev` и `coursing-stats-parsers` — ссылки на `docs/` (плоская структура)
- [ ] Memories в этом файле совпадают с `GETTING-STARTED.md`

---

## Обновление этого документа

При новых критических правилах обновляй: этот файл → `.cursor/rules/` → skills → `GETTING-STARTED.md`.

**Дата последнего обновления:** 2026-07-06
