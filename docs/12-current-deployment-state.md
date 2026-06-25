# 12. Текущее состояние развертывания

**Обновлено:** 2026-06-25

## GitHub

- **Репозиторий:** https://github.com/antajl/ProCoursing
- **Ветка:** main
- **Secrets (настроены):** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **GitHub Actions:**
  - `.github/workflows/update-db.yml` — еженедельное обновление текущего года (понедельник 03:00 UTC) + `workflow_dispatch`
  - `.github/workflows/deploy-frontend.yml` — автоматический деплой фронтенда при push в main с изменениями в `frontend/`

## Cloudflare Pages (фронтенд)

- **URL:** https://procoursing.pages.dev (также preview: `*.procoursing-stats.pages.dev`)
- **Статус:** ✅ React + Vite + TailwindCSS развёрнут
- **Сборка:** `frontend/dist/`

## Cloudflare Worker API

- **URL:** https://procoursing-stats.antajltube.workers.dev
- **Статус:** ✅ Активен
- **Cron:** понедельник 02:00 UTC (логирует намерение; реальное обновление — через GitHub Actions)

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/top/placement` | Топ по местам (`breed`, `year`, `minStarts`, `limit`, `offset`) |
| GET | `/api/top/score` | Топ по очкам |
| GET | `/api/top/speed` | Топ по скорости (racing) |
| GET | `/api/dogs/:id` | Профиль собаки |
| GET | `/api/dogs/:id/events` | История выступлений |
| GET | `/api/breeds` | Список пород |
| GET | `/api/years` | Список годов |
| GET | `/api/events` | Календарь событий |
| POST | `/api/update/trigger` | Ручной триггер (информирует о GitHub Actions) |

## Cloudflare D1 (production / remote)

- **Имя:** `pc-db`
- **ID:** `a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4`
- **Размер:** ~21 MB (после полного синка 2026-06-25)

### Данные на remote (актуально)

| Таблица | Записей |
|---------|---------|
| events | 302 |
| dogs | ~1579 |
| results | 4639 |

### По годам (results)

| Год | Результатов |
|-----|-------------|
| 2023 | 771 |
| 2024 | 1086 |
| 2025 | 1971 |
| 2026 | 811 |
| 2015–2022 | нет (изображения на сайте, нужен OCR) |

### Выполненные миграции remote

1. `data/migrate-normalize-dogs.sql` — нормализация кличек (1456 запросов)
2. `data/migrate-remote-schema.sql` — колонки `competition_kind`, `competition_type`, `last_modified`, `judge_count`
3. `data/sync-events.sql`, `sync-dogs.sql`, `sync-results.sql` — полный синк с локальной D1

## Локальная D1 (miniflare)

Путь: `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`

Содержимое совпадает с remote (источник правды для бэкафилла). Запуск API локально: `npx wrangler dev` → http://127.0.0.1:8787

## wrangler.toml

```toml
name = "procoursing-stats"
main = "backend/src/worker.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 2 * * 1"]

[[d1_databases]]
binding = "DB"
database_name = "pc-db"
database_id = "a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4"
```

## Команды эксплуатации

```bash
# Локальная разработка (Worker + Frontend)
npm run dev

# Еженедельное обновление текущего года (CI или вручную)
npm run ci-update-db

# Синхронизация локальной D1 → remote (после бэкафилла)
npm run sync-to-remote

# Нормализация кличек (локально + SQL для remote)
npm run migrate-dog-names
npx wrangler d1 execute pc-db --remote --file=./data/migrate-normalize-dogs.sql

# Миграция схемы remote (один раз, если отстаёт от schema.sql)
npx wrangler d1 execute pc-db --remote --file=./data/migrate-remote-schema.sql

# Деплой Worker
npx wrangler deploy

# Деплой фронтенда
cd frontend && npm run build && npx wrangler pages deploy dist --project-name procoursing
```

## npm-скрипты (корень)

| Скрипт | Назначение |
|--------|------------|
| `npm run dev` | Worker + Vite параллельно |
| `npm run scrape-index` | Индекс событий 2015–2026 |
| `npm run load-events` / `load-results` | Генерация SQL из JSON |
| `npm run ci-update-db` | Инкремент текущего года → remote D1 |
| `npm run sync-to-remote` | Полный синк локальной D1 → remote |
| `npm run migrate-dog-names` | Нормализация кличек в локальной D1 |
