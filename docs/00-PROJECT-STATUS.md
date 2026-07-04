# Project Status — Актуальное состояние ProCoursing Stats

> Обновлять этот файл при каждом значимом изменении.
> **Последнее обновление:** 2026-07-03

## Домены

| Сервис | URL |
|--------|-----|
| Фронтенд | https://procoursing.antajl.ru |
| API | https://procoursing-stats.antajltube.workers.dev |
| GitHub | https://github.com/antajl/ProCoursing |

## Технический стек

- **Backend:** Cloudflare Worker (Hono) + D1 (SQLite) + Node.js/TypeScript (скрипты через `npx tsx`)
- **Frontend:** React + Vite + TailwindCSS + React Query + Zod (кастомные `components/ui/`, без shadcn)
- **Деплой:** Cloudflare Pages (фронт) + Workers (API) + D1 (БД)
- **Автоматизация:** GitHub Actions (обновление D1 по понедельникам, рекорды скорости ежедневно)
- **CI:** `package-lock.json` в репозитории (для `npm ci` в GitHub Actions)
- **Локальная разработка:** `npm run dev` → Worker `--remote` + Vite (актуальная D1)

## Состояние базы данных (local = remote)

| Таблица | Записей |
|---------|---------|
| events | 219 |
| dogs | ~1579 |
| results | 4639 |
| speed_records | из Google Sheets (автообновление) |

**Распределение results по годам:**
- 2023: 771 (22 события)
- 2024: 1086 (27 событий)
- 2025: 1971 (50 событий)
- 2026: 811 (16 событий)
- 2015–2022: недоступны (изображения, нужен OCR)

## Что работает

- ✅ API на Cloudflare Worker (Hono): `/api/competitions`, `/api/dogs`, `/api/top/*`, `/api/judges`, `/api/speed-records`, `/api/coursing-records`
- ✅ Фронтенд на Cloudflare Pages с полной мобильной адаптацией
- ✅ Разделы: Главная (WIP), Соревнования, Судьи, Рекорды Донино, Профиль собаки, Результаты события
- ✅ Lazy routes + code-splitting (`AppRoutes.tsx`, `vite.config.ts` с `manualChunks`; крупные страницы разбиты на модули)
- ✅ Календарь событий: единый список `EventListRow`, inline-фильтры, `participants_count` в API (2026-07-03)
- ✅ UI polish (2026-07-03 вечер): матовый `nav-glass`, светлая тема по умолчанию, календарь/рейтинг/Донино/результаты — см. `CHANGES-2026-07-03.md` (сессия UI)
- ✅ Скрапер календаря: `backend/parsers/calendar/scrape-year-page.ts` — диапазоны дат, `[отменён]`, мультидисциплины в `rank_label`, корректные `results_url` (тесты `calendar-scrape.test.ts`)
- ✅ Production D1: календарь и reparse 2025 обновлены 2026-07-03 (см. `docs/data/CALENDAR-AND-DB-UPDATE.md`)
- ✅ GitHub Actions: обновление D1 (понедельник 02:00 UTC), рекорды скорости (ежедневно 03:00 UTC)
- ✅ Admin API с авторизацией через `X-Admin-Token` (секрет в Cloudflare)
- ✅ TypeScript, React Query, Zod, Hono, Sentry (базовая интеграция)
- ✅ Фикстуры парсеров: `backend/tests/fixtures/{coursing,bzmp,racing}/` с реальным HTML
- ✅ Тесты парсеров: `npm run test-parser` (синтетика), `npm run test-parser-fixtures` (v2 модульные парсеры на фикстурах)

## Что не сделано / в планах

- ❌ OCR для результатов 2015–2022 (хранятся как изображения)
- ❌ Sentry DSN не настроен (конфигурация создана, проект в Sentry не создан)
- 🔄 Модульные парсеры v2 в продакшен-reparse (`reparse-by-year.ts`); v1 `parse-results-*.ts` — legacy/CLI
- 🔄 In-process Worker-тесты — `api.test.ts` пропущен; планируется vitest@4 + `@cloudflare/vitest-pool-workers`; пока `npm run smoke-api` с dev-сервером
- 🔄 `Home.tsx` — WIP лендинг (ждёт ревью `CLAUDE PLAN/`)
- 🔄 Таблица «Замер скорости» / «Бега борзых» — limit=1000; статистика внутри дисциплины (`?view=stats`) — limit=10000; замер — `speed_records`, 350 м — `coursing_records` (см. `SPEED_RECORDS.md`)
- 📋 Подробнее: `docs/plans/FUTURE-PLANS.md`

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

> Подробные правила: `docs/ai/GUIDELINES.md`  
> Навигация фронтенда для ИИ: `docs/development/FRONTEND-MAP.md`  
> Календарь и заливка D1: `docs/data/CALENDAR-AND-DB-UPDATE.md`  
> История решений: `docs/history/DECISIONS-LOG.md`
