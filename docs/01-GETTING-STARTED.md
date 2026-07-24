# Getting Started — Быстрый старт

> **Карта документации:** [README.md](README.md). Данные: [03-DATA.md](03-DATA.md). Деплой: [20-OPERATIONS.md](20-OPERATIONS.md). Для ИИ: README → [00-AI-GUIDE.md](00-AI-GUIDE.md) → 03-DATA.

## Предварительные требования

- Node.js 22+ (CI; локально обычно 18+)
- npm
- Git
- Учётная запись Cloudflare (только для деплоя)

## Установка

```bash
git clone https://github.com/antajl/Coursing-Stats.git
cd Coursing-Stats
npm install
cd frontend && npm install && cd ..
```

## Запуск

```bash
# data/v1/ уже в git. При необходимости пересобрать indexes:
npm run build-all-data

npm run dev   # Vite :5173 + admin API :8787
```

После парсинга в локальную SQLite: `npm run sync-sqlite-to-v1`, затем `npm run build-all-data`.

Windows: `scripts/start-servers.bat` (локально; см. `scripts/README.md`).

Вручную:

```bash
# Терминал 1
npx tsx backend/src/local-dev-server.ts
# Терминал 2
cd frontend && npm run dev
```

Legacy D1 (только импорт): stubs [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) / [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) → `docs/archive/`. Runtime — [`03-DATA.md`](03-DATA.md).

## Первые шаги

1. **API:** при `npm run dev` → `npm run smoke-api` (или http://127.0.0.1:8787/api/years).
2. **Фронт:** http://localhost:5173 — светлая тема по умолчанию; тёмная в шапке (`localStorage.theme`).
3. **Парсеры:** `npm run test-parser` · `npm run test-parser-fixtures`.

## Структура (кратко)

```
backend/     # local-dev API, парсеры, скрипты сборки data/v1
frontend/    # React SPA (staticData → /data/v1/)
data/v1/     # runtime данные в git
docs/        # эта документация
scripts/     # start-servers, deploy-to-github, calendar flags
```

Карта UI: [04-FRONTEND.md](04-FRONTEND.md). Скрипты/npm: [11-DEVELOPMENT.md](11-DEVELOPMENT.md).

## Домены

| Сервис | URL |
|--------|-----|
| Прод | https://coursing-stats.ru |
| Данные (CDN) | https://coursing-stats.ru/data/v1/ |
| Локальный фронт | http://localhost:5173 |
| Локальный API | http://127.0.0.1:8787 |

## Деплой

```bash
# После правок competitions/ / indexes — чеклист в 20-OPERATIONS
git push origin main   # CI: build-all-data → Cloudflare Pages
```

Коммиты и push — только по явной просьбе. Worker в прод не деплоится. Диагностика пустого рейтинга: [03a-DATA-DIAGNOSTICS.md](03a-DATA-DIAGNOSTICS.md).

## Разделы сайта

Главная · Соревнования (рейтинг / судьи / календарь по `ui-flags`) · Выставки · Донино · профили · справочник `/guide`.  
Публичный surface (календари, протоколы, плашка): [04-FRONTEND.md](04-FRONTEND.md) → «Public surface».

## Известные ограничения

- OCR протоколов-картинок 2015–2022 — нет
- Sentry DSN на проде не настроен
- Полные протоколы `/event/:id` и `/shows/exhibition/:id` — только локальный DEV
- In-process Worker-тесты (`api.test.ts`) пропущены — используйте `smoke-api`

## Парсеры

Все скрипты — `.ts` через `npx tsx`. Пути: `backend/parsers/{coursing,bzmp,racing,calendar,shows}/`.  
Правила: [14-PARSING-RULES.md](14-PARSING-RULES.md). Фикстуры: `backend/tests/fixtures/`.

## Критические правила

1. procoursing.ru — windows-1251 через `backend/lib/fetch-win1251.ts`
2. `total_score` = `grand_total`, **не делить** на судей
3. Два рейтинга (медали / очки) — **не смешивать**; в UI вкладка **«медали»**, по умолчанию активна она
4. API: `/api/competitions`, не `/api/events` (uBlock)
5. Перед правкой парсера: `npm run test-parser` + `npm run test-parser-fixtures`

Подробно: [00-AI-GUIDE.md](00-AI-GUIDE.md).

## Дальше по задаче

| Задача | Документ |
|--------|----------|
| Архитектура | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) |
| Данные / indexes | [03-DATA.md](03-DATA.md) |
| UI / маршруты | [04-FRONTEND.md](04-FRONTEND.md) |
| Локальный admin API | [05-API-REFERENCE.md](05-API-REFERENCE.md) |
| Деплой / runbook | [20-OPERATIONS.md](20-OPERATIONS.md) |
| Тесты | [08-TESTING.md](08-TESTING.md) |
| Справочник `/guide` | [10-GUIDE.md](10-GUIDE.md) |

## Вклад в проект

1. Форк → ветка → PR на GitHub
2. Тесты: `npm test`, `npm run smoke-api`, `npm run test-parser-fixtures`, при UI — `npm run test:e2e` ([08-TESTING.md](08-TESTING.md))
3. Frontend lint: `cd frontend && npm run lint`
4. Документацию обновляйте в **каноне** по [README.md](README.md) (без дублей абзацев)
5. Commit messages: `feat:` / `fix:` / `docs:` / `refactor:`

Вопросы — issue на GitHub.
