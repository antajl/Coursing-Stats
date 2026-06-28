# Deployment — Деплой и инфраструктура

Документация по деплою и инфраструктуре ProCoursing Stats.

## Обзор

**Стек:**
- Cloudflare Pages — фронтенд
- Cloudflare Worker — бэкенд (API)
- Cloudflare D1 — база данных (SQLite)

**Домены:**
- Фронтенд: https://procoursing.antajl.ru
- API: https://api.procoursing.antajl.ru
- GitHub: https://github.com/antajl/ProCoursing

---

## Cloudflare Pages

### Конфигурация

**Проект:** ProCoursing Stats Frontend

**Source:** GitHub repository `antajl/ProCoursing`

**Build settings:**
- Build command: `cd frontend && npm run build`
- Build output directory: `frontend/dist`

**Environment variables:**
- `VITE_API_URL`: `https://api.procoursing.antajl.ru`

### GitHub Actions

**Workflow:** `.github/workflows/deploy-frontend.yml`

**Триггеры:**
- Push в ветку `main`
- Manual dispatch

**Процесс:**
1. Checkout кода
2. Установка зависимостей
3. Build фронтенда
4. Деплой на Cloudflare Pages

### SPA Routing

Файл `frontend/public/_redirects`:
```
/* /index.html 200
```

Это обеспечивает корректную работу React Router на Cloudflare Pages.

---

## Cloudflare Worker

### Конфигурация

**Worker name:** `procoursing-stats`

**Main:** `backend/src/worker.js`

**Compatibility date:** 2024-01-01

### D1 Binding

**Database name:** `pc-db`

**Database ID:** `a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4`

**Binding name:** `DB`

### wrangler.toml

```toml
name = "procoursing-stats"
main = "backend/src/worker.js"
compatibility_date = "2024-01-01"

[vars]
ADMIN_TOKEN = "your-secret-token"

[[d1_databases]]
binding = "DB"
database_name = "pc-db"
database_id = "a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4"
```

**Environment Variables:**
- `ADMIN_TOKEN` — токен для авторизации admin endpoints (например, `/api/admin/import-results`)

### GitHub Actions

**Workflow:** `.github/workflows/update-db.yml`

**Триггеры:**
- Cron: понедельник 02:00 UTC
- Manual dispatch

**Secrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**Процесс:**
1. Checkout кода
2. Установка зависимостей
3. Скрапинг индекса событий
4. Загрузка событий в D1
5. Загрузка результатов в D1
6. Синк local → remote D1

---

## Cloudflare D1

### Local Development

```bash
cd backend
npx wrangler d1 execute pc-db --local --command="SELECT * FROM events LIMIT 5"
```

### Remote Development

```bash
cd backend
npx wrangler d1 execute pc-db --command="SELECT * FROM events LIMIT 5"
```

### Import/Export

**Import SQL file:**
```bash
npx wrangler d1 execute pc-db --file=script.sql
```

**Local import:**
```bash
npx wrangler d1 execute pc-db --local --file=script.sql
```

---

## GitHub Actions

### Workflows

#### deploy-frontend.yml

Деплой фронтенда на Cloudflare Pages.

**Триггеры:**
- Push в `main`
- Manual dispatch

#### update-db.yml

Обновление D1 базы данных.

**Триггеры:**
- Cron: понедельник 02:00 UTC
- Manual dispatch

**Скрипт:** `backend/scripts/ci-update-db.mjs`

#### update-speed-records.yml

Обновление рекордов скорости из Google Sheets.

**Триггеры:**
- Cron: ежедневно 03:00 UTC
- Manual dispatch

**Скрипт:** `backend/scripts/speed/fetch-speed-records.mjs`

### Secrets

**Required:**
- `CLOUDFLARE_API_TOKEN` — API токен Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` — ID аккаунта Cloudflare

---

## Домены

### Фронтенд

**Primary:** https://procoursing.antajl.ru

**Cloudflare Pages default:** https://procoursing.pages.dev

### API

**Primary:** https://api.procoursing.antajl.ru

**Cloudflare Worker default:** https://procoursing-stats.antajltube.workers.dev

**Примечание:** Custom domain для Worker требует платного плана Cloudflare.

---

## Локальная разработка

### Запуск серверов

**Автоматический запуск:**
```bash
npm run dev
```

**Windows batch:**
```bash
start-local.bat
```

**Вручную:**

Терминал 1:
```bash
cd backend
npx wrangler dev --remote --port 8787
```

Терминал 2:
```bash
cd frontend
npm run dev
```

### Использование remote D1

Для локальной разработки используется remote D1 (--remote флаг).

---

## Мониторинг

### Worker Logs

```bash
npx wrangler tail procoursing-stats
```

### D1 Queries

```bash
npx wrangler d1 execute pc-db --command="EXPLAIN QUERY PLAN SELECT * FROM events"
```

---

## Резервное копирование

### Экспорт данных

```bash
# Экспорт событий
npx wrangler d1 execute pc-db --command="SELECT * FROM events" --output=events.json

# Экспорт результатов
npx wrangler d1 execute pc-db --command="SELECT * FROM results" --output=results.json
```

### SQL экспорт

Скрипт синхронизации создает SQL файлы:
- `data/sync-events.sql`
- `data/sync-results.sql`
- `data/sync-dogs.sql`

---

## Полезные ссылки

- Cloudflare Dashboard: https://dash.cloudflare.com
- Cloudflare Pages: https://dash.cloudflare.com/pages
- Cloudflare Workers: https://dash.cloudflare.com/workers
- Cloudflare D1: https://dash.cloudflare.com/d1
- GitHub Repository: https://github.com/antajl/ProCoursing
- wrangler.toml: `wrangler.toml`
- Worker source: `backend/src/worker.js`
