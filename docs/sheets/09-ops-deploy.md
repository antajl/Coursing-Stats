---
title: Operations & Deployment
verified: 2026-10-01
---

# 09 — Operations & Deployment

## Purpose

Инфраструктура, хостинг, пайплайн деплоя сайта и Telegram-бота, управление секретами.

## Truth table

| Область | Реализация |
|---------|------------|
| Прод сайта | **Yandex Object Storage** (`https://storage.yandexcloud.net`) |
| CDN корень | `https://coursing-stats.ru/data/v1/` |
| Публичный runtime | **Отсутствует** (чистый статический хостинг + CDN JSON, без D1/Workers на проде сайта) |
| Пайплайн деплоя сайта | **GitHub Actions** (`.github/workflows/deploy.yml`) по пушу в `main` |
| Деплой бота | **Manual only**: `cd bot; yarn run build; yarn run deploy` (Cloudflare Workers) |
| Cron обновления Донино | `.github/workflows/update-speed-records.yml` (еженедельно по вторникам) |
| Локальная разработка | `yarn run dev` → Vite SPA на `http://localhost:5173` |
| Секреты сайта | GitHub Repository Secrets (`AWS_*`, `S3_BUCKET`, `VITE_TURSO_*`) |
| Секреты бота | Cloudflare Workers Dashboard / `wrangler secret put` |
| Локальные секреты | `.env.ai` (gitignored) |

---

## Архитектура деплоя

```
[Git Push -> main]
       │
       ▼
GitHub Actions (deploy.yml)
       │
       ├── 1. yarn install && cd frontend && yarn install
       ├── 2. cd frontend && yarn build  -> frontend/dist/
       ├── 3. aws s3 sync frontend/dist/ -> s3://$S3_BUCKET/ (Yandex Object Storage)
       └── 4. If data/v1/ changed:
              aws s3 sync data/v1/ -> s3://$S3_BUCKET/data/v1/ (Yandex Object Storage)
```

---

## Деплой Telegram-бота

Бот хостится на **Cloudflare Workers**:
- **Запрещено** деплоить бота автоматически в CI сайта.
- Деплой выполняется исключительно вручную разработчиком после проверки тестов:

```bash
cd bot
yarn run build       # Проверка типов tsc (обязательно!)
yarn test            # Vitest тесты логики бота
yarn run deploy      # Wrangler deploy в Cloudflare Workers
```

---

## Локальная разработка

```bash
# Установка всех зависимостей
yarn install
cd frontend && yarn install

# Запуск dev-сервера (Vite на порту :5173)
yarn run dev

# Проверка тестов
yarn test

# Полная пересборка индексов данных перед релизом
yarn run build-all-data
```

---

## Управление секретами

| Секрет | Где хранится | Назначение |
|--------|--------------|------------|
| `AWS_ACCESS_KEY_ID` | GitHub Secrets | Ключ доступа к Yandex Object Storage (S3 API) |
| `AWS_SECRET_ACCESS_KEY` | GitHub Secrets | Секретный ключ к Yandex Object Storage |
| `S3_BUCKET` | GitHub Secrets | Имя бакета Yandex Object Storage |
| `VITE_TURSO_URL` | GitHub Secrets / `.env.ai` | URL базы Turso для протоколов выставок |
| `VITE_TURSO_AUTH_TOKEN` | GitHub Secrets / `.env.ai` | Токен доступа к Turso |
| `TELEGRAM_BOT_TOKEN` | Cloudflare Workers Secrets | Токен Telegram-бота |
| `TELEGRAM_SECRET_TOKEN` | Cloudflare Workers Secrets | Секрет валидации вебхука Telegram |

> [!WARNING]
> Никакие секреты никогда не должны попадать в Git-коммиты, документацию или скиллы. Все локальные файлы с ключами (`.env.ai`, `bot/.dev.vars`) находятся в `.gitignore`.

---

## Мониторинг и проверка доступности

1. **Сайт:** Проверка ответа `https://coursing-stats.ru` и CDN-файлов (например, `https://coursing-stats.ru/data/v1/manifest.json`).
2. **Бот:** Проверка эндпоинта `/health` на воркере Cloudflare.
3. **Логи воркера:** Cloudflare Dashboard → Workers & Pages → `coursing-stats-bot` → Logs.

---

## See also

[00-overview](00-overview.md) · [02-data-pipeline](02-data-pipeline.md) · [08-bot](08-bot.md) · [10-security](10-security.md) · [ROADMAP](../ROADMAP.md)
