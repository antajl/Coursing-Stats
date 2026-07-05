# Quick Start — Быстрый старт

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
cd Coursing Stats

# Установка зависимостей
npm install
cd frontend
npm install
cd ..
```

## Запуск серверов

### Локальная разработка (использует remote D1)

```bash
# Автоматический запуск обоих серверов
npm run dev
```

Или вручную:

```bash
# Терминал 1: Backend (Worker) — remote D1 для актуальных events/judges
cd backend
npx wrangler dev --remote --port 8787
# Запускается на http://127.0.0.1:8787

# Терминал 2: Frontend (Vite)
cd frontend
npm run dev
# Запускается на http://localhost:5173
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
- **Фронтенд (маршруты):** `frontend/src/AppRoutes.tsx`, гид: `docs/development/FRONTEND-MAP.md`
- **React компоненты:** `frontend/src/components/`
- **Схема БД:** `backend/schema.sql`

## Следующие шаги

- Прочитайте [ai/GUIDELINES.md](ai/GUIDELINES.md) для правил работы с проектом
- Прочитайте [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) для понимания архитектуры
- Прочитайте [architecture/API-REFERENCE.md](architecture/API-REFERENCE.md) для работы с API
- Прочитайте [data/PARSING.md](data/PARSING.md) для понимания парсинга

## Полезные ссылки

- **Фронтенд:** http://localhost:5173
- **API:** http://127.0.0.1:8787
- **Производственный фронтенд:** https://coursing-stats.ru
- **Производственный API:** https://api.coursing-stats.ru
- **GitHub:** https://github.com/antajl/Coursing-Stats
- **Источник данных:** http://procoursing.ru
