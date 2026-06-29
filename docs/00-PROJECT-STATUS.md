# Project Status — Актуальное состояние ProCoursing Stats

> Обновлять этот файл при каждом значимом изменении.
> **Последнее обновление:** 2026-06-29

## Домены

| Сервис | URL |
|--------|-----|
| Фронтенд | https://procoursing.antajl.ru |
| API | https://api.procoursing.antajl.ru |
| GitHub | https://github.com/antajl/ProCoursing |

## Технический стек

- **Backend:** Cloudflare Worker (Hono) + D1 (SQLite) + Node.js/TypeScript (скрипты)
- **Frontend:** React + Vite + TailwindCSS + React Query + Zod
- **Деплой:** Cloudflare Pages (фронт) + Workers (API) + D1 (БД)
- **Автоматизация:** GitHub Actions (обновление D1 по понедельникам, рекорды скорости ежедневно)

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

- ✅ API на Cloudflare Worker (Hono): `/api/competitions`, `/api/dogs`, `/api/top/*`, `/api/judges`, `/api/speed-records`
- ✅ Фронтенд на Cloudflare Pages с полной мобильной адаптацией
- ✅ Разделы: Календарь, Рейтинг, Судьи, Рекорды Донино, Профиль собаки, Результаты события
- ✅ GitHub Actions: обновление D1 (понедельник 02:00 UTC), рекорды скорости (ежедневно 03:00 UTC)
- ✅ Admin API с авторизацией через `X-Admin-Token` (секрет в Cloudflare)
- ✅ TypeScript, React Query, Zod, Hono, Sentry (базовая интеграция)

## Что не сделано / в планах

- ❌ OCR для результатов 2015–2022 (хранятся как изображения)
- ❌ Sentry DSN не настроен (конфигурация создана, проект в Sentry не создан)
- ❌ Модульные парсеры (`parsers/coursing/`, `parsers/bzmp/`, `parsers/racing/`) не переключены в продакшен — скрипты перепарсинга используют старые `parse-results-*.ts`
- ❌ Code-splitting фронтенда (бандл 652 kB, предупреждение Vite)
- ❌ Фикстуры для парсеров (тесты только на синтетических данных)
- 📋 Подробнее: `docs/plans/FUTURE-PLANS.md`

## Парсеры — важно

Два набора парсеров сосуществуют:

| Файл | Статус | Используется |
|------|--------|-------------|
| `parsers/parse-results-coursing.ts` | v1, активный | reparse скрипты |
| `parsers/parse-results-bzmp.ts` | v1, активный | reparse скрипты |
| `parsers/parse-results-racing.ts` | v1, активный | reparse скрипты |
| `parsers/coursing/index.ts` | v2, модульный | пока не в продакшене |
| `parsers/bzmp/index.ts` | v2, модульный | пока не в продакшене |
| `parsers/racing/index.ts` | v2, модульный | пока не в продакшене |

## Критические правила (кратко)

1. Сайт procoursing.ru — windows-1251, всегда декодировать через `iconv-lite`
2. `total_score` = исходная `grand_total`, **не делить** на количество судей
3. Два отдельных рейтинга: по местам и по очкам — **не сводить в одну формулу**
4. `/api/events` → переименовано в `/api/competitions` (uBlock блокирует слово "events")
5. Перед изменением парсера: `npm run test-parser`

> Подробные правила: `docs/ai/GUIDELINES.md`
> История решений: `docs/history/DECISIONS-LOG.md`
