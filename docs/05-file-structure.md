# 05. File Structure — Организация файлов проекта

## Корневые файлы

| Файл | Назначение | Статус |
|------|------------|--------|
| `README.md` | Основная спецификация проекта | ✅ |
| `package.json` | Зависимости Node.js | ✅ |
| `package-lock.json` | Lock файл зависимостей | ✅ |
| `wrangler.toml` | Конфигурация Cloudflare Worker | ✅ |
| `start.bat` | Скрипт запуска серверов | ✅ |

## Папка backend/

Содержит весь backend-код (Node.js + Cloudflare Worker):

| Файл/Папка | Назначение | Статус |
|------------|------------|--------|
| `src/worker.js` | Cloudflare Worker API | ✅ |
| `schema.sql` | Схема БД D1 | ✅ |
| `parsers/` | Парсеры результатов событий | ✅ |
| `parsers/parse-results-coursing.mjs` | Парсер результатов курсинга | ✅ |
| `parsers/parse-results-bzmp.mjs` | Парсер результатов БЗМП | ✅ |
| `parsers/parse-results-racing.mjs` | Парсер результатов бега | ✅ |
| `lib/` | Общие модули | ✅ |
| `lib/fetch-win1251.mjs` | Загрузка страниц с декодированием windows-1251 | ✅ |
| `scripts/` | Скрипты загрузки данных | ✅ |
| `scripts/scrape-year-index.mjs` | Скрапер индекса событий по годам | ✅ |
| `scripts/load-events.mjs` | Загрузка событий в D1 | ✅ |
| `scripts/load-results.mjs` | Загрузка результатов в D1 | ✅ |
| `scripts/test-parser.mjs` | Тест парсера на синтетических данных | ✅ |
| `scripts/backfill-*.mjs` | Скрипты бэкафилла по годам | ✅ |

## Папка frontend/

Содержит React фронтенд:

| Файл/Папка | Назначение | Статус |
|------------|------------|--------|
| `src/` | React приложение | ✅ |
| `src/components/` | React компоненты | ✅ |
| `src/components/DogStatsTable.jsx` | Таблица статистики собак | ✅ |
| `src/components/DogTooltip.jsx` | Tooltip с информацией о собаке | ✅ |
| `src/pages/` | Страницы приложения | ✅ |
| `src/pages/DogProfile.jsx` | Профиль собаки | ✅ |
| `src/pages/Events.jsx` | Календарь событий | ✅ |
| `src/pages/TopDogs.jsx` | Рейтинги собак | ✅ |
| `src/services/` | API сервисы | ✅ |
| `src/services/api.js` | API клиент | ✅ |
| `src/data/` | Данные для разработки | ✅ |
| `src/data/mockData.js` | Мок данные | ✅ |
| `package.json` | Зависимости фронтенда | ✅ |
| `tailwind.config.js` | Конфигурация Tailwind CSS | ✅ |
| `vite.config.js` | Конфигурация Vite | ✅ |

## Папка data/

Содержит данные событий и SQL файлы:

| Файл | Назначение | Статус |
|------|------------|--------|
| `events-2023.json` | События 2023 года | ✅ |
| `events-2024.json` | События 2024 года | ✅ |
| `events-2025.json` | События 2025 года | ✅ |
| `events-2026.json` | События 2026 года | ✅ |
| `events-historical.json` | Исторические события (2015-2022) | ✅ |
| `events.json` | Все события вместе | ✅ |
| `load-events.sql` | SQL для загрузки событий | ✅ |
| `load-results.sql` | SQL для загрузки результатов | ✅ |

## Папка docs/

| Файл | Назначение |
|------|------------|
| `01-project-context.md` | Контекст проекта |
| `02-architecture.md` | Архитектура Cloudflare |
| `03-database-schema.md` | Схема БД |
| `04-statuses.md` | Обработка статусов |
| `05-file-structure.md` | Структура файлов (этот файл) |
| `06-ai-guidelines.md` | Рекомендации для ИИ |
| `07-tools-and-libraries.md` | Инструменты и библиотеки |
| `08-file-splitting-plan.md` | План разбивки файлов |
| `09-site-research-findings.md` | Исследование сайта |
| `10-racing-bzmp-structure.md` | Структура Racing/БЗМП |
| `11-deployment-guide.md` | Руководство по деплою |
| `12-current-deployment-state.md` | Текущее состояние деплоя |
| `13-final-setup-summary.md` | Итоговая сводка |
| `14-data-import-guide.md` | Руководство по импорту данных |
| `15-api-reference.md` | API документация |
| `AGENTS.md` | Правила для ИИ-агентов |
| `CHANGES.md` | Changelog изменений |
| `DATA_UPDATE_STRATEGY.md` | Стратегия обновления данных |
| `TECHNICAL_PLAN.md` | Технический план реализации |

## Архитектура проекта

```
Корень проекта
├── backend/              # Backend код
│   ├── src/              # Cloudflare Worker
│   ├── schema.sql        # Схема БД
│   ├── parsers/          # Парсеры результатов
│   ├── lib/              # Общие модули
│   └── scripts/          # Скрипты загрузки данных
├── frontend/             # React фронтенд
│   └── src/              # React приложение
├── data/                 # Данные событий и SQL файлы
├── docs/                 # Вся документация
└── Конфигурации (package.json, wrangler.toml, start.bat)
```

## Почему разделение на backend/frontend?

- **Четкое разделение ответственности** - backend и frontend изолированы
- **Легче находить файлы** - каждая часть проекта в своей папке
- **Удобнее деплой** - Cloudflare Pages деплоит только frontend/
- **Масштабируемость** - легко добавлять новые компоненты в каждую часть
- **Стандартная практика** - соответствует современным архитектурным паттернам

## Сгенерированные файлы

| Файл | Назначение | Восстановление |
|------|------------|----------------|
| `data/events.json` | События из скрапера | `npm run scrape-index` |
| `load-events.sql` | SQL для загрузки событий | `npm run load-events` |
| `load-results.sql` | SQL для загрузки результатов | `npm run load-results` |

## NPM Scripts

| Команда | Назначение |
|---------|------------|
| `npm run scrape-index` | Скрапинг индекса событий |
| `npm run parse-coursing` | Парсинг результатов курсинга |
| `npm run parse-bzmp` | Парсинг результатов БЗМП |
| `npm run parse-racing` | Парсинг результатов бега |
| `npm run load-events` | Загрузка событий в D1 |
| `npm run load-results` | Загрузка результатов в D1 |
