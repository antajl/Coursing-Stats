# Getting Started — Быстрый старт

Этот документ поможет вам быстро начать работу с проектом Coursing Stats.

## Предварительные требования

- Node.js 18+
- npm или yarn
- Git
- Учетная запись Cloudflare (для деплоя)

## Установка

```bash
# Клонирование репозитория
git clone https://github.com/antajl/Coursing-Stats.git
cd Coursing-Stats

# Установка зависимостей
npm install
cd frontend
npm install
cd ..
```

## Запуск серверов

### Локальная разработка (локальная D1 — не расходует квоту remote)

```bash
# Первый раз: скачать копию прод-БД
npm run sync-from-remote

# Запуск Worker :8787 + Vite :5173
npm run dev
```

Или вручную:

```bash
# Терминал 1: Backend (Worker) — локальная D1 в .wrangler/
npx wrangler dev backend/src/worker.ts --port 8787

# Терминал 2: Frontend (Vite)
cd frontend && npm run dev
```

**Актуальные прод-данные** (редко, когда нужна свежая remote БД):

```bash
npm run sync-from-remote   # обновить локальную копию
npm run dev:remote         # dev с remote D1 (съедает дневную квоту!)
```

### Windows (batch файл)

```bash
scripts\start-servers.bat
```

## Первые шаги

### 1. Проверка API

С запущенным `npm run dev`:

```bash
npm run smoke-api
```

Или вручную: http://127.0.0.1:8787/api/years — JSON со списком годов.

(Эндпоинта `/api/test` нет.)

### 2. Проверка фронтенда

Откройте http://localhost:5173 в браузере — должны увидеть главную страницу.

**Тема:** по умолчанию светлая. Тёмная — переключатель в шапке (сохраняется в `localStorage.theme`). После смены CSS/темы — жёсткое обновление (`Ctrl+Shift+R`).

### 3. Тестирование парсеров

```bash
npm run test-parser           # синтетика (v1)
npm run test-parser-fixtures  # v2 модульные на реальных HTML фикстурах
```

## Структура проекта

```
Coursing Stats/
├── backend/              # Worker API + парсеры + скрипты
│   ├── src/              # worker.ts, app.ts, routes/
│   ├── parsers/          # v1: parse-results-*.ts; v2: coursing/, bzmp/, racing/, unique/
│   ├── scripts/          # Все .ts (npx tsx): scrape/, load/, reparse/, test/, …
│   ├── tests/fixtures/   # Реальные HTML фикстуры парсеров
│   └── lib/              # fetch-win1251.ts, dog-lookup.ts
├── frontend/             # React (App.tsx, AppRoutes.tsx, Nav.tsx)
│   └── src/
├── docs/                 # Документация
└── data/                 # Данные (JSON, SQL) — в .gitignore для events/
```

## Основные команды

```bash
# Скрапинг индекса событий
npm run scrape-index

# Загрузка событий в D1
npm run load-events

# Загрузка результатов в D1
npm run load-results

# Инкремент текущего года → remote D1
npm run ci-update-db

# Синк локальной D1 → remote
npm run sync-to-remote

# Нормализация кличек в локальной D1
npm run migrate-dog-names

# Тесты
npm test
npm run smoke-api             # API smoke (нужен npm run dev)
npm run test-parser
npm run test-parser-fixtures
```

## Где что искать

- **API endpoints:** `backend/src/routes/`
- **Парсеры:** `backend/parsers/`
- **Скрипты:** `backend/scripts/`
- **Фронтенд (маршруты):** `frontend/src/AppRoutes.tsx`, гид: `DEVELOPMENT.md`
- **React компоненты:** `frontend/src/components/`
- **Схема БД:** `backend/schema.sql`

## Домены

| Сервис | URL |
|--------|-----|
| Фронтенд | https://coursing-stats.ru |
| API | https://api.coursing-stats.ru |
| GitHub | https://github.com/antajl/Coursing-Stats |

## Технический стек

- **Backend:** Cloudflare Worker (Hono) + D1 (SQLite) + Node.js/TypeScript (скрипты через `npx tsx`)
- **Frontend:** React + Vite + TailwindCSS + React Query + Zod (кастомные `components/ui/`, без shadcn)
- **Деплой:** Cloudflare Pages (фронт) + Workers (API) + D1 (БД)
- **Автоматизация:** GitHub Actions (обновление D1 и рекорды Донино **4 раза в день**: 08:00, 14:00, 20:00, 23:30 МСК)
- **CI:** `package-lock.json` в репозитории (для `npm ci` в GitHub Actions)
- **Локальная разработка:** `npm run dev` → Worker `--remote` + Vite (актуальная D1)

## Состояние базы данных (local = remote)

| Таблица | Записей |
|---------|---------|
| events | 225 (2015-2026) |
| dogs | 1619 |
| results | 2966 (2025-2026) |
| speed_records | 198 (из Google Sheets, автообновление) |
| coursing_records | 95 (из Google Sheets, автообновление) |

**Распределение results по годам:**
- 2025: 2114 (50 событий)
- 2026: 852 (51 событие)
- 2015–2024: недоступны (изображения, нужен OCR)

## Что работает

- ✅ API на Cloudflare Worker (Hono): `/api/competitions`, `/api/dogs`, `/api/top/*`, `/api/judges`, `/api/speed-records`, `/api/coursing-records`
- ✅ Фронтенд на Cloudflare Pages с полной мобильной адаптацией
- ✅ Разделы: Главная (hero, топ сезона, рекорды Донино), Соревнования, Судьи, Рекорды Донино, Профиль собаки, Профиль Донино, Результаты события
- ✅ Единый паттерн тулбара (`PageToolbar`) на рейтинге, судьях, рекордах Донино, **календаре** (`Events/index.tsx`)
- ✅ **Рекорды Донино** (`/speed-records`): одна страница, две колонки (Замер | Бега 350 м), переключатель Записи | Статистика; общая группировка в статистике; infinite scroll в списке
- ✅ Lazy routes + code-splitting (`AppRoutes.tsx`, `vite.config.ts` с `manualChunks`; крупные страницы разбиты на модули)
- ✅ Календарь событий: единый список `EventListRow`, inline-фильтры, `participants_count` в API
- ✅ UI polish: матовый `nav-glass`, светлая тема по умолчанию, календарь/рейтинг/Донино/результаты
- ✅ Скрапер календаря: `backend/parsers/calendar/scrape-year-page.ts` — диапазоны дат, `[отменён]`, мультидисциплины в `rank_label`, корректные `results_url` (тесты `calendar-scrape.test.ts`)
- ✅ Production D1: календарь и reparse 2025 обновлены
- ✅ GitHub Actions: обновление D1 и рекорды скорости (**4×/день**: 08:00, 14:00, 20:00, 23:30 МСК)
- ✅ Admin API с авторизацией через `X-Admin-Token` (секрет в Cloudflare)
- ✅ TypeScript, React Query, Zod, Hono, Sentry (базовая интеграция)
- ✅ Фикстуры парсеров: `backend/tests/fixtures/{coursing,bzmp,racing}/` с реальным HTML
- ✅ Тесты парсеров: `npm run test-parser` (синтетика), `npm run test-parser-fixtures` (v2 модульные парсеры на фикстурах)

## Что не сделано / в планах

- ❌ OCR для результатов 2015–2022 (хранятся как изображения)
- ❌ Sentry DSN не настроен (конфигурация создана, проект в Sentry не создан)
- 🔄 Модульные парсеры v2 в продакшен-reparse (`reparse-by-year.ts`); v1 `parse-results-*.ts` — legacy/CLI
- 🔄 In-process Worker-тесты — `api.test.ts` пропущен; планируется vitest@4 + `@cloudflare/vitest-pool-workers`; пока `npm run smoke-api` с dev-сервером
- 🔄 Тексты hero на главной (eyebrow/заголовок) — при необходимости уточнить формулировки про годы архива vs результаты в БД
- 📋 Подробнее: `FUTURE-PLANS.md`

## Парсеры — важно

Все скрипты — `.ts`, запуск через `npx tsx`. Файлов `.mjs` в проекте нет.

Два набора парсеров сосуществуют:

| Путь | Версия | Используется |
|------|--------|-------------|
| `parsers/parse-results-coursing.ts` | v1 | CLI, legacy |
| `parsers/parse-results-bzmp.ts` | v1 | CLI, legacy |
| `parsers/parse-results-racing.ts` | v1 | CLI, legacy |
| `parsers/coursing/index.ts` | v2 модульный | `reparse-by-year`, `test-parser-fixtures` |
| `parsers/bzmp/index.ts` | v2 модульный | `reparse-by-year`, `test-parser-fixtures` |
| `parsers/racing/index.ts` | v2 модульный | `reparse-by-year`, `test-parser-fixtures` |
| `parsers/calendar/scrape-year-page.ts` | календарь | `scrape-index`, `update-current-year`, тесты |
| `parsers/unique/` | v2 общие утилиты | shared row/header parsers |

**Фикстуры:** `backend/tests/fixtures/` — реальный HTML с procoursing.ru. Racing: `2026-05-16_Complete_Results_Racing.html`, `Complete_Results_2025-cc-sample.html` (ранее ошибочно лежали BZMP-файлы с суффиксом `_B`).

**Тестовые скрипты:** `backend/scripts/test/` — см. `README.md`; canonical: `test-parser.ts`, `test-parsers-fixtures.ts`, `download-fixtures.ts`, `smoke-api.ts`; отладка в `debug/`.

## Критические правила (кратко)

1. Сайт procoursing.ru — windows-1251, всегда декодировать через `iconv-lite` (`backend/lib/fetch-win1251.ts`)
2. `total_score` = исходная `grand_total`, **не делить** на количество судей
3. Два отдельных рейтинга: по местам и по очкам — **не сводить в одну формулу**
4. `/api/events` → переименовано в `/api/competitions` (uBlock блокирует слово "events")
5. Перед изменением парсера: `npm run test-parser` и `npm run test-parser-fixtures`

> Подробные правила: `AI-GUIDE.md`  
> Навигация фронтенда для ИИ: `DEVELOPMENT.md`  
> Календарь и заливка D1: `DATABASE.md`  
> История решений: `DECISIONS-LOG.md`

## Полезные ссылки

- **Фронтенд:** http://localhost:5173
- **API:** http://127.0.0.1:8787
- **Производственный фронтенд:** https://coursing-stats.ru
- **Производственный API:** https://api.coursing-stats.ru
- **GitHub:** https://github.com/antajl/Coursing-Stats
- **Источник данных:** http://procoursing.ru

## Следующие шаги

- Прочитайте `AI-GUIDE.md` для правил работы с проектом
- Прочитайте `ARCHITECTURE.md` для понимания архитектуры
- Прочитайте `API-REFERENCE.md` для работы с API
- Прочитайте `PARSING.md` для понимания парсинга
- Прочитайте `DATABASE.md` для работы с БД (включая календарь и заливку D1)
