# Coursing Stats — бренд и инфраструктура

> Единый справочник имён, доменов и сервисов. Обновлять при смене хостинга или ребрендинге.
> **Последнее обновление:** 2026-07-05

## Бренд

| | |
|--|--|
| **Название в UI** | Coursing Stats |
| **Коротко / код** | `coursing-stats` |
| **Источник данных** | [procoursing.ru](http://procoursing.ru) — внешний сайт, **не переименовывать** в парсерах и БД |

## Домены (продакшн)

| Роль | URL |
|------|-----|
| **Сайт** | https://coursing-stats.ru |
| **Сайт (www)** | https://www.coursing-stats.ru |
| **API** | https://api.coursing-stats.ru |
| **API (fallback Worker)** | https://coursingstatsworker.antajltube.workers.dev |

DNS зона `coursing-stats.ru` — в **Cloudflare** (NS с reg.ru на Cloudflare).

## Cloudflare

| Ресурс | Имя в дашборде |
|--------|----------------|
| **Pages** (фронт) | `coursingstats` |
| **Worker** (API) | `coursingstatsworker` |
| **D1** | `pc-db` (binding `DB`, id в `wrangler.toml`) |

### Деплой

- **GitHub Actions:** `.github/workflows/deploy-frontend.yml`
  - `VITE_API_URL=https://api.coursing-stats.ru`
  - `wrangler pages deploy ... --project-name=coursingstats`
  - `wrangler deploy` (Worker из `wrangler.toml`)

## GitHub

| | |
|--|--|
| **Репозиторий** | https://github.com/antajl/Coursing-Stats |
| **Ветка продакшн** | `main` |

## Код — ключевые файлы

| Файл | Назначение |
|------|------------|
| `wrangler.toml` | `name = "coursingstatsworker"` |
| `package.json` | `"name": "coursing-stats"` |
| `frontend/src/services/api.ts` | прод API URL |
| `frontend/index.html` | `<title>Coursing Stats</title>` |
| `frontend/src/AppRoutes.tsx` | маршрут `/competitions`, редирект `/procoursing` |

## Маршруты фронтенда

| Путь | Страница |
|------|----------|
| `/` | Главная |
| `/competitions` | Календарь, рейтинг, судьи (бывш. `/procoursing`) |
| `/procoursing` | → редирект на `/competitions` |
| `/event/:id` | Результаты события |
| `/speed-records` | Рекорды Донино |
| `/admin` | Админка |

## Легаси (не использовать для новых ссылок)

| Было | Статус |
|------|--------|
| procoursing.antajl.ru | редирект на coursing-stats.ru (настроить в Cloudflare) |
| procoursing-stats Worker | переименован в coursingstatsworker |
| antajl/ProCoursing | переименован в Coursing-Stats |
| ProCoursing Stats | Coursing Stats |

## User-Agent скрапера

`CoursingStatsBot/0.1` — в `backend/lib/fetch-win1251.ts`
