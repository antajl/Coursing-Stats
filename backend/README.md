# Backend — ProCoursing Stats

## Структура

```
backend/
├── src/
│   └── worker.js          # Cloudflare Worker API
├── schema.sql            # Схема базы данных D1
├── parsers/              # Парсеры результатов событий
│   ├── parse-results-coursing.mjs
│   ├── parse-results-bzmp.mjs
│   └── parse-results-racing.mjs
├── lib/                  # Общие модули
│   └── fetch-win1251.mjs # Загрузка с декодированием windows-1251
└── scripts/              # Скрипты загрузки данных
    ├── scrape-year-index.mjs
    ├── load-events.mjs
    ├── load-results.mjs
    └── backfill-*.mjs
```

## Установка зависимостей

```bash
cd d:/Site/SALUKI
npm install
```

## Локальная разработка

### Запуск Worker локально

```bash
npx wrangler dev backend/src/worker.js --port 8787
```

Worker будет доступен на `http://127.0.0.1:8787`

### Деплой на Cloudflare

```bash
npx wrangler deploy
```

## Скрапинг и загрузка данных

### Скрапинг индекса событий

```bash
npm run scrape-index
```

Создает `data/events.json` с событиями текущего года.

### Парсинг результатов

```bash
# Курсинг
npm run parse-coursing <url>

# БЗМП
npm run parse-bzmp <url>

# Беги
npm run parse-racing <url>
```

### Загрузка в базу данных

```bash
# Загрузка событий
npm run load-events data/events.json

# Загрузка результатов
npm run load-results data/events.json
```

### Выполнение SQL на D1

```bash
# Локально
npx wrangler d1 execute pc-db --local --file=./data/load-events.sql
npx wrangler d1 execute pc-db --local --file=./data/load-results.sql

# Production
npx wrangler d1 execute pc-db --file=./data/load-events.sql
npx wrangler d1 execute pc-db --file=./data/load-results.sql
```

## API Эндпоинты

- `GET /api/test` - тест подключения
- `GET /api/top/placement?breed=&year=` - топ по местам
- `GET /api/top/score?breed=&year=` - топ по очкам
- `GET /api/dogs/:id` - профиль собаки
- `GET /api/breeds` - список пород
- `GET /api/years` - список годов
- `GET /api/events?year=` - список событий

Подробнее см. `docs/15-api-reference.md`

## База данных

Схема базы данных в `backend/schema.sql`.

Таблицы:
- `events` - мероприятия
- `dogs` - собаки
- `results` - результаты выступлений

Views:
- `v_top_by_placement` - медальный зачёт
- `v_top_by_score` - топ по очкам
