# Getting Started — Быстрый старт

> **Карта документации:** [README.md](README.md). Данные и workflow: [DATA.md](DATA.md). Для ИИ: README → AI-GUIDE → DATA.

Этот документ поможет вам быстро начать работу с проектом Coursing Stats.

## Предварительные требования

- Node.js 22+ (CI; локально обычно 18+)
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

### Локальная разработка (файлы `data/v1/` — D1 не нужна)

```bash
# Первый раз: выгрузить данные в data/v1/ (из локальной или remote D1)
npm run sync-from-remote          # опционально: свежая копия D1
npm run export-local-data -- --local

# Запуск API :8787 (читает data/v1/) + Vite :5173
npm run dev
```

Старый режим с локальной D1: `npm run dev:d1` (нужен `sync-from-remote`).

Или вручную:

```bash
# Терминал 1: Backend (файловые данные)
npx tsx backend/src/local-dev-server.ts

# Терминал 2: Frontend (Vite)
cd frontend && npm run dev
```

**Свежий импорт из remote D1** (редко): см. [DATA.md](DATA.md) — `sync-from-remote` → `export-local-data`.

### Windows (batch файл)

```bash
scripts\start-servers.bat
```

### scripts/ — Windows Batch Scripts

Директория содержит вспомогательные batch скрипты для Windows:

```
scripts/
├── README.md              # Краткая справка по скриптам
├── start-servers.bat      # Запуск локальных серверов (npm run dev)
└── deploy-to-github.bat   # Деплой в GitHub (git push)
```

**Использование:**

- `start-servers.bat` — альтернатива `npm run dev` для Windows, запускает backend API :8787 и frontend Vite :5173
- `deploy-to-github.bat` — альтернатива ручному `git push`, выполняет commit и push в GitHub

Эти скрипты удобны для быстрого запуска на Windows без ввода команд в терминал.

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
├── backend/              # local-dev API, парсеры, скрипты сборки data/v1
│   ├── src/              # worker.ts, app.ts, routes/
│   ├── parsers/          # v1: parse-results-*.ts; v2: coursing/, bzmp/, racing/, unique/
│   ├── scripts/          # Все .ts (npx tsx): scrape/, load/, reparse/, test/, …
│   ├── tests/fixtures/   # Реальные HTML фикстуры парсеров
│   └── lib/              # fetch-win1251.ts, dog-lookup.ts
├── frontend/             # React (App.tsx, AppRoutes.tsx, Nav.tsx)
│   └── src/
├── docs/                 # Документация (см. README.md, DATA.md)
└── data/
    └── v1/               # Каноническая файловая БД (runtime)
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
| Данные (CDN) | https://coursing-stats.ru/data/v1/ |
| API (только локально) | http://127.0.0.1:8787 (`npm run dev`) |
| GitHub | https://github.com/antajl/Coursing-Stats |

## Технический стек

- **Frontend:** React + Vite + TailwindCSS + React Query + Zod
- **Runtime data:** `data/v1/` на Pages CDN — подробно: [03-DATA.md](03-DATA.md)
- **Локально:** `npm run dev` (Vite `:5173` + админка `:8787`); legacy: `npm run dev:d1`

## Деплой

```bash
npm run build-all-data   # опционально локально; CI сделает сам
git push origin main     # или scripts\deploy-to-github.bat
```

Перед push после правок `competitions/` или `data/v1/`: убедитесь, что `npm run build-data-snapshot` показывает **`results` > 0**, и `npm run build-all-data` не падает. Иначе на проде опустеют рейтинг и судьи — см. `docs/03-DATA.md` → «Диагностика».

Push в `main` → GitHub Actions → Cloudflare Pages. Worker в прод не деплоится. Подробно: [03-DATA.md](03-DATA.md), [04-DEVELOPMENT.md](04-DEVELOPMENT.md).

## Что работает

- ✅ **Публичный прод:** статика `/data/v1/` на CDN — без Worker, без cold start
- ✅ **Локальная админка:** `/api` на `:8787` (события, результаты, sync → `data/v1/`)
- ✅ Фронтенд на Cloudflare Pages с полной мобильной адаптацией
- ✅ Разделы: Главная (hero, топ сезона, рекорды Донино), **Статистика** (рейтинг + судьи), Рекорды Донино, Профиль собаки, Профиль Донино
- ✅ **Публично без календаря и протоколов** (вариант A, договорённость с procoursing.ru): протоколы → ссылки на procoursing.ru; локально — `/admin/calendar`, `/admin/event/:id`
- ✅ Атрибуция «Расчёты на основе данных procoursing.ru» на страницах расчётов; iframe: `frame-ancestors` в `frontend/public/_headers`
- ✅ Единый паттерн тулбара (`PageToolbar`) на рейтинге, судьях, рекордах Донино; календарь — только в dev (`Events/index.tsx` → `/admin/calendar`)
- ✅ **Рекорды Донино** (`/speed-records`): одна страница, две колонки (Замер | Бега 350 м), переключатель Записи | Статистика; общая группировка в статистике; infinite scroll в списке
- ✅ Lazy routes + code-splitting (`AppRoutes.tsx`, `vite.config.ts` с `manualChunks`; крупные страницы разбиты на модули)
- ✅ Календарь событий (локально): `EventListRow`, inline-фильтры — `/admin/calendar` в dev
- ✅ UI polish: матовый `nav-glass`, светлая тема по умолчанию, рейтинг/Донино
- ✅ Скрапер календаря: `backend/parsers/calendar/scrape-year-page.ts` — диапазоны дат, `[отменён]`, мультидисциплины в `rank_label`, корректные `results_url` (тесты `calendar-scrape.test.ts`)
- ✅ Production D1: календарь и reparse 2025 обновлены
- ✅ GitHub Actions: рекорды Donino (**4×/день**: 08:00, 14:00, 20:00, 23:30 МСК) → D1 + `data/v1/donino/speed_records.json`
- ✅ GitHub Actions: обновление D1 — **вручную** (`update-db.yml`, `workflow_dispatch`)
- ✅ Admin API с `X-Admin-Token` — **только локально** (`npm run dev`, env `ADMIN_API_TOKEN`)
- ✅ TypeScript, React Query, Zod, Hono, Sentry (базовая интеграция)
- ✅ Sitemap (`/sitemap.xml`) и precomputed indexes в CI
- ✅ Файловый архив: `npm run export-archive` → `data/archive/snapshots/`
- ✅ Sitemap + favicon.ico для поисковиков
- ✅ Страница `/guide` (справочник правил и протоколов)
- ✅ Тесты парсеров: `npm run test-parser` (синтетика), `npm run test-parser-fixtures` (v2 модульные парсеры на фикстурах)
- ✅ E2E (Playwright): `npm run test:e2e` — см. `TESTING.md`

## Что не сделано / в планах

- ❌ OCR для результатов 2015–2022 (хранятся как изображения)
- ❌ Sentry DSN не настроен (конфигурация создана, проект в Sentry не создан)
- 🔄 Модульные парсеры v2 в продакшен-reparse (`reparse-by-year.ts`); v1 `parse-results-*.ts` — legacy/CLI
- 🔄 In-process Worker-тесты — `api.test.ts` пропущен; пока `npm run smoke-api` с `npm run dev`
- 🔄 Тексты hero на главной (eyebrow/заголовок) — при необходимости уточнить формулировки про годы архива vs результаты в БД
- 📋 Подробнее: `FUTURE-PLANS.md`

## Парсеры — важно

Все скрипты — `.ts`, запуск через `npx tsx`. Файлов `.mjs` в проекте нет.

Два набора парсеров сосуществуют:

| Путь | Версия | Используется |
|------|--------|-------------|
| `backend/parsers/parse-results-coursing.ts` | v1 | CLI, legacy |
| `backend/parsers/parse-results-bzmp.ts` | v1 | CLI, legacy |
| `backend/parsers/parse-results-racing.ts` | v1 | CLI, legacy |
| `backend/parsers/coursing/index.ts` | v2 модульный | `reparse-by-year`, `test-parser-fixtures` |
| `backend/parsers/bzmp/index.ts` | v2 модульный | `reparse-by-year`, `test-parser-fixtures` |
| `backend/parsers/racing/index.ts` | v2 модульный | `reparse-by-year`, `test-parser-fixtures` |
| `backend/parsers/calendar/scrape-year-page.ts` | календарь | `scrape-index`, `update-current-year`, тесты |
| `backend/parsers/unique/` | v2 общие утилиты | shared row/header parsers |

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

- **Фронтенд:** http://localhost:5173 (данные: `/data/v1/` с диска через Vite)
- **API (админка):** http://127.0.0.1:8787
- **Продакшн:** https://coursing-stats.ru
- **GitHub:** https://github.com/antajl/Coursing-Stats
- **Источник данных:** http://procoursing.ru

## Следующие шаги

- Прочитайте `00-AI-GUIDE.md` для правил работы с проектом
- Прочитайте `02-ARCHITECTURE.md` для понимания архитектуры
- Прочитайте `05-API-REFERENCE.md` для работы с API
- Прочитайте `14-PARSING-RULES.md` и `15-PARSING-IMPLEMENTATION.md` для понимания парсинга
- Прочитайте `03-DATA.md` для файловой БД и обновления прода
- Прочитайте `12-DATABASE-SCHEMA.md` и `13-DATABASE-WORKFLOW.md` для работы с БД (календарь, заливка, лимиты D1)
- Прочитайте `10-GUIDE.md` если правите справочник `/guide`
- Прочитайте `08-TESTING.md` перед добавлением тестов

---

## Вклад в проект

Этот раздел описывает, как внести вклад в проект Coursing Stats.

### Как начать

1. Форкните репозиторий на GitHub
2. Клонируйте ваш форк: `git clone https://github.com/YOUR_USERNAME/Coursing-Stats.git`
3. Создайте ветку для вашей фичи: `git checkout -b feature/my-feature`
4. Внесите изменения
5. Запушьте в вашу ветку: `git push origin feature/my-feature`
6. Откройте Pull Request на GitHub

### Тестирование

```bash
npm test                    # vitest (api.test.ts сейчас describe.skip)
npm run smoke-api           # ручная проверка API (нужен npm run dev)
npm run test-parser         # синтетические тесты парсеров v1
npm run test-parser-fixtures # v2 модульные парсеры на реальных фикстурах
npm run test:e2e             # Playwright E2E (поднимает dev-сервер)
```

Подробнее: `TESTING.md`.

### Линтинг

```bash
# Frontend
cd frontend
npm run lint
```

### Стандарты кода

**Backend:**
- Используйте TypeScript
- Следуйте существующему стилю кода
- Добавляйте комментарии для сложной логики
- Используйте Zod для валидации данных

**Frontend:**
- Используйте TypeScript
- Следуйте существующему стилю кода
- Используйте TailwindCSS для стилей
- Не используйте эмодзи в UI (используйте SVG иконки или текст)
- Следуйте дизайн-системе (см. `DESIGN-SYSTEM.md`)

### Документация

Если вы добавляете новую функцию:
- Обновите этот документ (`GETTING-STARTED.md`)
- Обновите `README.md` если нужно
- Добавьте документацию в соответствующий раздел docs/
- Обновите `CHANGELOG.md` для визуальных изменений

### Commit сообщения

Используйте понятные commit сообщения:
```
feat: добавить новую страницу статистики
fix: исправить парсинг результатов для 2026 года
docs: обновить документацию API
refactor: переименовать компоненты
```

### Pull Requests

- Описывайте что и почему вы меняете
- Ссылайтесь на соответствующие issues
- Убедитесь, что все тесты проходят
- Убедитесь, что код соответствует стандартам стиля
- Проверьте, что документация обновлена

### Вопросы

Если у вас есть вопросы, откройте issue на GitHub или свяжитесь с владельцем проекта.
