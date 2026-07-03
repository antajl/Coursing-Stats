---
name: procoursing-dev
description: Локальная разработка ProCoursing Stats — запуск серверов, npm-скрипты, деплой Cloudflare, синхронизация D1. Использовать при работе с wrangler, GitHub Actions, загрузкой данных или вопросами «как запустить / задеплоить».
---

# ProCoursing — разработка и деплой

## Быстрый старт

```bash
npm run dev                    # Worker :8787 + Vite :5173
curl http://127.0.0.1:8787/api/test
```

Windows: `scripts\start-servers.bat`

## Ключевые npm-скрипты

| Команда | Назначение |
|---------|------------|
| `npm run scrape-index` | Индекс событий с procoursing.ru |
| `npm run load-events` | События → D1 |
| `npm run load-results` | Результаты → D1 (через Admin API) |
| `npm run ci-update-db` | Инкремент текущего года → remote D1 |
| `npm run sync-to-remote` | Local D1 → remote |
| `npm test` | Тесты |

## Деплой

- **Фронт:** GitHub Actions → Cloudflare Pages (`deploy-frontend.yml`)
- **API:** Worker `procoursing-stats`, D1 `pc-db`
- **Cron:** понедельник 02:00 UTC (D1), ежедневно 03:00 UTC (speed records)

`VITE_API_URL` для прод-сборки задаётся в `.github/workflows/deploy-frontend.yml`, не в Cloudflare Pages env.

## Документация

- `docs/01-QUICK-START.md` — установка
- `docs/development/DEVELOPMENT.md` — структура файлов
- `docs/development/DEPLOYMENT.md` — инфраструктура

## Безопасность БД

Перед DELETE: `npx wrangler d1 export pc-db --remote --output=data/backups/remote-backup-YYYY-MM-DD.sql`
