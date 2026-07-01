# Quick Start — Быстрый старт

Этот документ поможет вам быстро начать работу с проектом ProCoursing Stats.

## Предварительные требования

- Node.js 18+ 
- npm или yarn
- Git
- Учетная запись Cloudflare (для деплоя)

## Установка

```bash
# Клонирование репозитория
git clone https://github.com/antajl/ProCoursing.git
cd ProCoursing

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
# Терминал 1: Backend (Worker)
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

Откройте http://127.0.0.1:8787/api/test в браузере — должны увидеть JSON ответ.

### 2. Проверка фронтенда

Откройте http://localhost:5173 в браузере — должны увидеть главную страницу.

### 3. Тестирование парсера

```bash
cd backend
npx tsx scripts/test/test-parser.ts
```

## Структура проекта

```
ProCoursing/
├── backend/          # Backend (Worker API + парсеры)
│   ├── src/          # Worker source
│   ├── parsers/      # Парсеры (coursing, BZMP, racing)
│   ├── scripts/      # Скрипты загрузки данных
│   └── lib/          # Общие модули
├── frontend/         # Frontend (React)
│   └── src/          # React приложение
├── docs/             # Документация
└── data/             # Данные (JSON, SQL)
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
```

## Где что искать

- **API endpoints:** `backend/src/routes/`
- **Парсеры:** `backend/parsers/`
- **Скрипты:** `backend/scripts/`
- **React страницы:** `frontend/src/pages/`
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
- **Производственный фронтенд:** https://procoursing.antajl.ru
- **Производственный API:** https://procoursing-stats.antajltube.workers.dev
- **GitHub:** https://github.com/antajl/ProCoursing
- **Источник данных:** http://procoursing.ru
