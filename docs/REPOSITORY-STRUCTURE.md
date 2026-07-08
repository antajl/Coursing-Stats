# Структура репозитория

Карта папок проекта: что где лежит и зачем.  
**Runtime сайта** — только `data/v1/` (см. [DATA.md](DATA.md)). Остальное — код, вспомогательные данные, черновики.

---

## Корень репозитория

| Папка / файл | Назначение | В git |
|--------------|------------|-------|
| `backend/` | API (локальный dev), парсеры procoursing.ru, npm-скрипты данных | да |
| `frontend/` | React SPA (Vite), публичный UI | да |
| `data/` | Все JSON/SQL/HTML артефакты данных | частично (см. ниже) |
| `docs/` | Документация для людей и ИИ | да |
| `scripts/` | Windows `.bat`: запуск dev, push на GitHub | да |
| `e2e/` | Playwright end-to-end тесты | да |
| `.cursor/` | Правила и skills для Cursor (`rules/`, `skills/`) | да |
| `.github/workflows/` | CI: тесты, `build-all-data`, деплой Pages | да |
| `.wrangler/` | Локальный кэш Wrangler (D1 dev) | нет |
| `node_modules/` | Зависимости npm | нет |
| `playwright-report/`, `test-results/` | Отчёты тестов | нет |

---

## `backend/` — сервер, парсеры, скрипты

| Путь | Назначение |
|------|------------|
| `src/local-dev-server.ts` | Dev API `:8787` — админка, чтение/запись `data/v1/` |
| `src/worker.ts` | Legacy Cloudflare Worker (`npm run dev:d1`), **не деплоится в CI** |
| `src/routes/` | Hono-роуты: `events.ts` → `/api/competitions`, admin, top, judges |
| `src/lib/` | Общая логика API (рейтинги, судьи, кэш) |
| `lib/fetch-win1251.ts` | Загрузка procoursing.ru с декодированием windows-1251 |
| `lib/fetch-archive-win1251.ts` | То же из web.archive.org (сырой снимок `id_/`) |
| `lib/local-data/` | Загрузка `data/v1/*.json` в sqlite для админки |
| `lib/event-identity.ts` | Ключ дедупликации событий календаря |
| `lib/rank-discipline-mapping.ts` | Маппинг и нормализация rank_code, discipline_code, event titles |
| `lib/dog-lookup.ts` | Поиск собак по имени и породе |
| `parsers/coursing/`, `bzmp/`, `racing/` | Модульные парсеры результатов (v2, целевые) |
| `parsers/calendar/` | Парсер страниц `s_{YEAR}.html` календаря |
| `parsers/shared/`, `unique/` | Общие куски парсеров |
| `tests/` | Vitest; `fixtures/` — эталонный HTML для парсеров |
| `schema.sql` | Схема D1 (импорт, не runtime прод) |
| `migrations/` | SQL миграции для D1 |

### `backend/scripts/` — группы скриптов

| Папка | Назначение | Примеры |
|-------|------------|---------|
| `archive/` | Скрап календаря с procoursing и web.archive | `scrape-year-index.ts`, `backfill-*.ts` |
| `web-archive/` | Парсинг календарей и результатов из web.archive | `parse-calendar-*.ts`, `add-missing-*.ts` |
| `load/` | Загрузка в D1 (SQL / API) | `load-events.ts`, `load-results.ts` |
| `export/` | D1 → файлы | `export-local-data-v1.ts`, `export-data-archive.ts` |
| `import/` | Внешние источники → файлы | `download-archive-results.ts` |
| `reparse/` | Перепарсинг протоколов в D1 | `reparse-by-year.ts` |
| `migrate/` | Разовые миграции `data/v1` | `dedupe-calendar-v1.ts`, `remove-archive-extra-ids.ts` |
| `sync/` | Синхронизация sqlite ↔ v1, D1 local ↔ remote | `sync-sqlite-to-v1.ts` |
| `speed/` | Донино (Google Sheets → D1 / JSON) | `fetch-speed-records.ts` |
| `ci/` | Сборка для GitHub Actions / Pages | `package-pages-snapshot.ts` |
| `test/` | Ручные проверки парсеров и API | см. `test/README.md` |
| `update/` | Обновление данных | `update-current-year.ts` |
| корень | Оркестрация и утилиты | `build-all-data.ts`, `build-derived-indexes.ts`, `rebuild-calendar-index.ts`, `build-events-by-id-index.ts`, `fix-event-*.ts`, `free-dev-port.ts`, `generate-favicon.ts`, `build-data-snapshot.ts` |

---

## `frontend/` — клиент

| Путь | Назначение |
|------|------------|
| `src/lib/staticData.ts` | **Публичный сайт:** `fetch('/data/v1/...')` |
| `src/lib/` | Утилиты (breedMapping, judgeStats, qualificationTitles, recordDates, etc.) |
| `src/pages/` | Страницы: Home, Events, DogProfile, SpeedRecords, Judges, Admin, Guide, TopDogs, Competitions, NotFound |
| `src/pages/Events/EventResults/` | Компоненты страницы результатов (EventHeader, ResultCard, ResultsSection, details, utils) |
| `src/pages/SpeedRecords/stats/` | Компоненты статистики Донино (SpeedStatsView, CoursingStatsView, DoninoStatsSummary) |
| `src/components/` | UI-компоненты (toolbar, cards, badges, etc.) |
| `src/hooks/` | React hooks (useApi, useDarkMode, useGsap*, useInfiniteScroll) |
| `src/services/` | API сервисы (api.ts) |
| `src/schemas/` | TypeScript схемы для валидации |
| `src/data/` | Mock данные для dev |
| `vite.config.ts` | Dev: отдаёт `../data/v1` по `/data/v1/*` |
| `public/` | Статика (favicon, assets); `public/data/v1/` — **копия для prod**, генерируется CI |
| `tailwind.config.js` | Tailwind CSS конфигурация |
| `postcss.config.js` | PostCSS конфигурация |
| `eslint.config.js` | ESLint конфигурация |

---

## `WebArchiveResults/` — web.archive.org данные

| Путь | Назначение | В git |
|------|------------|-------|
| `calendars/` | HTML календари с web.archive.org (2015-2024) | да |
| `pages/{year}/` | HTML протоколы соревнований с web.archive.org (2022-2024) | да |
| `result-links.json` | Индекс ссылок на результаты | да |

Используется для парсинга исторических данных. Источник правды для парсинга, но не для runtime сайта.

---

## `data/` — данные

### ★ `data/v1/` — источник правды для сайта

Подробно: [DATA.md](DATA.md), кратко: [data/v1/README.md](../data/v1/README.md).

В git. После правок competitions/dogs — `npm run build-all-data`.

---

### `data/archive/` — долгоживущий архив

Подробно: [DATA-ARCHIVE.md](DATA-ARCHIVE.md), [data/archive/README.md](../data/archive/README.md).

| Путь | Назначение | В git |
|------|------------|-------|
| `snapshots/` | Снимки D1 (`npm run export-archive`): SQL + JSON по таблицам | нет |
| `results/` | HTML протоколов соревнований с web.archive.org (2023–2024) | нет* |
| `results/manifest.json` | Индекс: URL, `event_id`, статус скачивания | нет* |
| `_schema/v1/` | Черновик **будущей** файловой схемы (не текущий v1) | да |

\*Папку можно коммитить по желанию; по умолчанию не отслеживается — пересобирается `npm run download-archive-results`.

**Workflow архивных результатов:**
1. `npm run download-archive-results` → `data/archive/results/{year}/*.html`
2. (позже) парсинг → `data/v1/competitions/`

---

### `data/tmp/` — временные рабочие файлы

| Путь | Назначение | В git |
|------|------------|-------|
| `tmp/archive/s_{YEAR}.html` | Снимки календаря procoursing с web.archive.org (для сверки, дедупа) | нет |

Не источник правды. Можно удалить и скачать заново скриптами сравнения календаря.

---

### `data/backup/` — отчёты разовых операций

| Путь | Назначение | В git |
|------|------------|-------|
| `{дата}-calendar-dedupe/` | Отчёт `dedupe-calendar-v1` (что удалено, id remap) | нет |
| `{дата}-archive-extra-ids/` | Отчёт удаления лишних id календаря | нет |
| `{дата}-archive-results-import/` | (будущее) отчёт импорта протоколов | нет |

Только JSON-отчёты для аудита. В git остаётся только `data/backup/README.md`.

---

### `data/backups/` — ручные бэкапы D1

SQL-дампы `wrangler d1 export` перед опасными операциями. См. [DATABASE.md](DATABASE.md). **Не в git.**

---

### `data/imports/` — пакетная загрузка в D1

| Файл | Назначение |
|------|------------|
| `load-events.sql` | INSERT событий из скрапа |
| `load-results.sql` | INSERT результатов |
| `speed-records.sql`, `coursing-records.sql` | Донино |

Генерируются скриптами `load/`; применяются через `wrangler d1 execute`.

---

### `data/migrations/` — миграции схемы D1

Исторические `ALTER TABLE`, индексы, нормализация. Применяются вручную на local/remote D1. Не связаны с `data/v1/` напрямую.

---

### Устаревшие / генерируемые пути (не использовать как v1)

| Путь | Статус |
|------|--------|
| `data/events/` | Промежуточный JSON скрапа календаря → D1. В `.gitignore` |
| `data/competitions/` | Старый экспорт (до `data/v1/competitions/`). В `.gitignore` |
| `data/exports/` | SQL для sync local→remote. В `.gitignore` |
| `data/updates/` | Пакеты SQL reparse. В `.gitignore` |
| `data/temp/` | В `.gitignore` |

---

## `docs/`

| Путь | Назначение |
|------|------------|
| `README.md` | Оглавление |
| `AI-GUIDE.md` | Инструкция для ИИ-агентов |
| `DATA.md` | Канон по `data/v1/` |
| `REPOSITORY-STRUCTURE.md` | Этот файл |
| `_archive/` | Старые планы — **не источник правды** |

---

## Быстрая схема потоков данных

```
procoursing.ru / web.archive.org
        │
        ├─ parsers + scripts ──► D1 (импорт)
        │                              │
        │                              ▼ export-local-data
        ├─ download-archive-results ──► data/archive/results/
        │                              │
        └──────────────────────────────┼──► data/v1/  ◄── git, CDN
                                       │         │
                                       │         ├─ build-derived-indexes → indexes/
                                       │         └─ package-pages-snapshot → frontend/public/
                                       ▼
                              data/backup/ (отчёты)
                              data/archive/snapshots/ (D1 dump)
```

---

## Связанные документы

- [DATA.md](DATA.md) — редактирование `data/v1/`
- [DATA-ARCHIVE.md](DATA-ARCHIVE.md) — снимки D1
- [ARCHITECTURE.md](ARCHITECTURE.md) — компоненты и деплой
- [DEVELOPMENT.md](DEVELOPMENT.md) — фронтенд, npm-скрипты
- [PARSING.md](PARSING.md) — парсеры windows-1251
- [SCRIPTS.md](SCRIPTS.md) — документация скриптов backend
- [RANK-DISCIPLINE-CODES.md](RANK-DISCIPLINE-CODES.md) — коды рангов и дисциплин
