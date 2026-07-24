# Getting Started — Быстрый старт

> **Карта документации:** [README.md](README.md). Данные и workflow: [03-DATA.md](03-DATA.md). Для ИИ: README → 00-AI-GUIDE → 03-DATA.

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
# data/v1/ уже в git после clone. При необходимости пересобрать indexes:
npm run build-all-data

# Запуск API :8787 (читает data/v1/) + Vite :5173
npm run dev
```

После парсинга в локальную SQLite: `npm run sync-sqlite-to-v1`, затем `npm run build-all-data`.

Документы `12-DATABASE-SCHEMA.md` / `13-DATABASE-WORKFLOW.md` описывают legacy D1 — ориентируйтесь на код и [`03-DATA.md`](03-DATA.md).

Или вручную:

```bash
# Терминал 1: Backend (файловые данные)
npx tsx backend/src/local-dev-server.ts

# Терминал 2: Frontend (Vite)
cd frontend && npm run dev
```

### Windows (batch файл)

```bash
scripts/start-servers.bat  # local only, not in git
```

### scripts/ — Shell Scripts

Директория содержит вспомогательные скрипты:

```
scripts/
└── README.md              # Краткая справка по скриптам
```

**Примечание:** Windows batch скрипты (start-servers.bat, deploy-to-github.bat) удалены из GitHub и доступны только локально.

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
│   ├── parsers/          # coursing/, bzmp/, racing/, unique/, shared/, calendar/, shows/
│   ├── scripts/          # Все .ts (npx tsx): scrape/, load/, reparse/, test/, …
│   ├── tests/fixtures/   # Реальные HTML фикстуры парсеров
│   └── lib/              # fetch-win1251.ts, dog-lookup.ts
├── frontend/             # React (App.tsx, AppRoutes.tsx, Nav.tsx)
│   └── src/
├── docs/                 # Документация (см. README.md, 03-DATA.md)
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
git push origin main
```

Перед push после правок `competitions/` или `data/v1/`: см. чеклист в [20-OPERATIONS.md](20-OPERATIONS.md). Канон: [03a-DATA-DIAGNOSTICS.md](03a-DATA-DIAGNOSTICS.md).


Push в `main` → GitHub Actions → Cloudflare Pages. Worker в прод не деплоится. Подробно: [20-OPERATIONS.md](20-OPERATIONS.md), [04-DEVELOPMENT.md](04-DEVELOPMENT.md).

## Что работает

- ✅ **Публичный прод:** статика `/data/v1/` на CDN — без Worker, без cold start
- ✅ **Локальная админка:** `/api` на `:8787` (события, результаты, sync → `data/v1/`)
- ✅ Фронтенд на Cloudflare Pages с полной мобильной адаптацией
- ✅ Разделы: Главная (hero, топ сезона, рекорды Донино), **Статистика** (рейтинг + судьи), Рекорды Донино, Профиль собаки, Профиль Донино
- ✅ **Breed Archive:** ссылка на breedarchive.com в профиле собаки (`pedigree_url`); enrich: `npm run enrich-breedarchive-urls` → `build-all-data`
- ✅ **Публичный UI (вариант A):** по умолчанию рейтинги/судьи/профили; календари на проде — флаги `data/v1/ui-flags.json`. Протоколы → ссылки на procoursing.ru / rkf.online; локально — `/event/:id`, `/shows/exhibition/:id`. Временно: календарь соревнований на проде + плашка `TemporaryCompetitionsCalendarBanner`
- ✅ Атрибуция «Расчёты на основе данных [procoursing.ru](http://procoursing.ru/)» на страницах расчётов; на `/competitions` — **вверху карточки**; iframe: `frame-ancestors` в `frontend/public/_headers`
- ✅ Единый паттерн тулбара (`PageToolbar bare` + `ToolbarFiltersDropdown`): рейтинг, судьи, рекорды Донино — одна строка, секции фильтров с чекбоксами; **рейтинг:** породы из `dogs-index` (с выступлениями), год можно снять → «все годы»; календарь соревнований — framed panel (`Events/index`)
- ✅ **Рекорды Донино** (`/speed-records`): одна страница, две колонки (Замер | Бега 350 м); **Записи | Статистика** в меню «Донино»; группировка в статистике — в панели «Фильтры»; infinite scroll в списке
- ✅ Lazy routes + code-splitting (`AppRoutes.tsx`, `vite.config.ts` с `manualChunks`; крупные страницы разбиты на модули)
- ✅ Календарь соревнований: `EventListRow` + `ProcoursingEventLink` — `/competitions?tab=calendar` (прод: ui-flags; строки не `return null` без local path)
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
- ✅ Страница `/guide` (справочник: соревнования, выставки, протоколы, рейтинг CS)
- ✅ Тесты парсеров: `npm run test-parser` (синтетика), `npm run test-parser-fixtures` (парсеры на фикстурах)
- ✅ E2E (Playwright): `npm run test:e2e` — см. [08-TESTING.md](08-TESTING.md)

## Что не сделано / в планах

- ❌ OCR для результатов 2015–2022 (хранятся как изображения)
- ❌ Sentry DSN не настроен (конфигурация создана, проект в Sentry не создан)
- ✅ Парсеры `coursing/` / `bzmp/` / `racing/` — единственный путь (v1 `parse-results-*.ts` удалён)
- 🔄 In-process Worker-тесты — `api.test.ts` пропущен; пока `npm run smoke-api` с `npm run dev`
- 🔄 Тексты hero на главной (eyebrow/заголовок) — при необходимости уточнить формулировки про годы архива vs результаты в БД
- 📋 Подробнее: `FUTURE-PLANS.md`

## Парсеры — важно

Все скрипты — `.ts`, запуск через `npx tsx`. Файлов `.mjs` и v1 `parse-results-*.ts` в проекте нет.

| Путь | Используется |
|------|-------------|
| `backend/parsers/coursing/index.ts` | `reparse-by-year`, `parse-coursing`, fixtures |
| `backend/parsers/bzmp/index.ts` | `reparse-by-year`, `parse-bzmp`, fixtures |
| `backend/parsers/racing/index.ts` | `reparse-by-year`, `parse-racing`, fixtures |
| `backend/parsers/calendar/scrape-year-page.ts` | `scrape-index`, `update-current-year`, тесты |
| `backend/parsers/unique/` | экспериментальный |
| `backend/parsers/shared/` | общие хелперы |

**Фикстуры:** `backend/tests/fixtures/` — реальный HTML с procoursing.ru. Racing: `2026-05-16_Complete_Results_Racing.html`, `Complete_Results_2025-cc-sample.html` (ранее ошибочно лежали BZMP-файлы с суффиксом `_B`).

**Тестовые скрипты:** `backend/scripts/test/` — см. `README.md`; canonical: `test-parser.ts`, `test-parsers-fixtures.ts`, `download-fixtures.ts`, `smoke-api.ts`; отладка в `debug/`.

## Критические правила (кратко)

1. Сайт procoursing.ru — windows-1251, всегда декодировать через `iconv-lite` (`backend/lib/fetch-win1251.ts`)
2. `total_score` = исходная `grand_total`, **не делить** на количество судей
3. Два отдельных рейтинга: по местам и по очкам — **не сводить в одну формулу**
4. `/api/events` → переименовано в `/api/competitions` (uBlock блокирует слово "events")
5. Перед изменением парсера: `npm run test-parser` и `npm run test-parser-fixtures`

> Подробные правила: [00-AI-GUIDE.md](00-AI-GUIDE.md)  
> Фронтенд: [04-FRONTEND.md](04-FRONTEND.md) · Backend: [04-DEVELOPMENT.md](04-DEVELOPMENT.md)  
> D1: [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md), [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — **LEGACY**, только импорт

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
- Прочитайте `12-DATABASE-SCHEMA.md` и `13-DATABASE-WORKFLOW.md` только для D1/импорта (**LEGACY**)

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

Подробнее: [08-TESTING.md](08-TESTING.md).

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
- Обновите этот документ (`01-GETTING-STARTED.md`)
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
