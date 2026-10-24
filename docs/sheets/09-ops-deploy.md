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
| Cron обновления Донино | `.github/workflows/update-speed-records.yml` (2 раза в день: 05:00 и 17:00 UTC) |
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

## Политика кэширования (S3 / Yandex Object Storage)

Для идеальных показателей Core Web Vitals и оптимизации трафика деплой `deploy.yml` выставляет строгие заголовки `Cache-Control`:

| Тип ресурса | Путь | Cache-Control | Зачем |
|---|---|---|---|
| Хэшированные чанки JS/CSS | `/assets/*` | `public, max-age=31536000, immutable` | Кэш на 1 год: имена содержат контентный хэш и build-stamp, повторная загрузка исключена |
| Статические медиа | `/assets/hero/*`, баннеры, фавиконки | `public, max-age=604800` | Кэш на 1 неделю |
| Входные HTML | `index.html`, `404.html` | `public, max-age=0, must-revalidate` | Мгновенное применение новых версий без задержки |
| SPA Fallback | S3 `--error-document index.html` | — | Роутинг динамических страниц (профили выставочных собак, фильтры) через клиентский SPA React |
| Данные CDN | `/data/v1/*` | `public, max-age=3600, must-revalidate` | Кэш на 1 час для экономии трафика мобильных клиентов |

---

## SPA Роутинг и Fallback на S3 (Yandex Object Storage)

Сайт работает по гибридной схеме (SSG + Client SPA):
1. **SSG (Static Site Generation)**:
   При сборке в CI скрипт `yarn prerender-seo` генерирует готовые статичные файлы `index.html` для хабов, соревнований, Донино, выставок, судей и топ-15 000 самых активных выставочных собак (по числу выставок). На такие запросы S3 отвечает чистым `HTTP 200 OK` с полной микроразметкой и метатегами для роботов Google и Яндекс.
2. **SPA Fallback (Client Hydration)**:
   Для сотен тысяч остальных собак выставок и динамических фильтров физические HTML-файлы на диске отсутствуют. При прямом переходе по ссылке вида `/dog/{id}` из поисковика S3 отдаёт оболочку сайта через `--error-document index.html`. Браузер запускает React, считывает ID собаки из URL, подгружает CDN-шард (`shows/indexes/dog-details/{000-255}.json`) и мгновенно отображает профиль.
3. **Строгий инвариант**:
   Запрещено переключать `--error-document` на статический `404.html` без JS или вырезать скрипты из `404.html` — это ломает SPA-роутинг и вызывает ошибку 404 у пользователей при переходах из поиска на профили собак.

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
