---
title: Overview
verified: 2026-10-01
---

# 00 — Overview

## Purpose

CoursingStats — агрегатор статистики собак: соревнования (procoursing.ru), выставки РКФ, замеры Донино, Telegram-бот. Прод: https://coursing-stats.ru · GitHub: antajl/Coursing-Stats.

## Truth table

| Факт | |
|------|--|
| Публичный сайт | Static React SPA на **Yandex Object Storage** → CDN `/data/v1/*.json` |
| Worker/D1 в prod сайта | **Нет** (чистый статический хостинг без runtime бэкенда) |
| Источник правды данных | `data/v1/` в git |
| Bot | Cloudflare Workers + Grammy + KV |
| Package manager | **yarn@1.22.22** |
| Календари на проде | ON (`data/v1/ui-flags.json`) |
| Turso | Только протоколы выставок RKF (не ranking/calendar) |
| CDN packs | Профили спорта и судьи выставок — `pack-*.json` ([ADR-014](../decisions/014-cdn-packs-vs-turso.md)) |
| CDN slim | `dogs/by-id` и bulk exhibitions **не** копируются на прод |

**Статистика (ориентир 2026-09):** соревнования 161/163 с results / ~2 577 dogs / ~9 104 результатов; выставки ~62k в каталоге; Донино — отдельные JSON.

## Key files

- `AGENTS.md` — короткий entry
- `docs/ROADMAP.md` — дорожная карта и 4 ветки рефакторинга
- `docs/MAP.md` — роутер
- `frontend/` — SPA (Vite + React 19)
- `backend/` — парсеры, build scripts, генерация индексов
- `bot/` — Telegram worker
- `data/v1/` — JSON канон

## Workflows

```bash
yarn run dev                 # Vite :5173
yarn run build-all-data      # indexes + copy + publish-gates
yarn test                    # backend vitest
cd bot; yarn run build       # перед деплоем бота
```

PowerShell: цепочки через `;`, не `&&`.

## Forbidden (без явного запроса)

- Все породы + архив 2015–2026 в UI
- Смержить medals и CS points; менять CS без `cs-v2` + guide
- Parse Breed Archive PDF (только URL)
- Ребрендить procoursing.ru
- Deploy Worker в CI сайта
- Commit/push без просьбы
- Runtime D1 на проде
- Полная история собаки в боте (только aggregates)

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · [09-ops-deploy](09-ops-deploy.md) · [decisions/](../decisions/)
