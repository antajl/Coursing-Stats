---
title: Telegram Bot
verified: 2026-08-07
---

# 08 — Bot

## Purpose

`@coursing_stats_bot` — те же CDN данные, что сайт; Cloudflare Workers + Grammy + KV.

## Truth table

| Факт | |
|------|--|
| Runtime | Cloudflare Workers |
| Framework | Grammy |
| Data | `https://coursing-stats.ru/data/v1/...` (или `SITE_URL`) |
| Secrets | `BOT_TOKEN`, `WEBHOOK_SECRET` (Workers secrets; `bot/.dev.vars` local) |
| Webhook | POST `/webhook` проверяет `X-Telegram-Bot-Api-Secret-Token` |
| Dog card | **aggregates only** — не дампить полную историю |
| Search | CDN + compact index; KV cache; competition dogs first, then Donino |
| Deploy | **manual only** — `cd bot; yarn run deploy` (не в site CI) |
| Menu photos | webp на `https://coursing-stats.ru/bot/*.webp` (source `public/bot`, sync → `frontend/public` при Vite build) |
| Notifications / cron | **не реализованы** |

### KV TTL (ориентир `bot/src/api.ts`)

| Key type | TTL |
|----------|-----|
| index / ratings / records / shows / judges / compact | 3600s |
| calendar / search results | 1800s |
| dog profile | 0 (no long cache) |
| favorites | 30 days |
| compare state | 5 min |
| rate limit | 60s window |

### CDN endpoints used

`indexes/dogs-index.json`, `bot-search-compact.json`, `dog-profiles/{id}.json`, `top-score-*`, `top-placement-*`, `top-speed-*` (racing), `calendar/{year}`, `donino/*`, `shows/calendar/{year}`, `shows/indexes/dog-ranking-{year}`, `judges-summary`, `shows/indexes/judges.json`

## Architecture

```
Telegram → POST /webhook (+ secret header)
  → worker.ts (rate limit KV, Grammy handleUpdate)
  → handlers/* (Composer modules)
  → api.ts → CDN + KV cache
```

## Key files

```
bot/src/worker.ts              # entry, webhook secret, rate limit
bot/src/api.ts                 # CDN client + KV TTL
bot/src/keyboards.ts           # inline keyboards
bot/src/handlers/index.ts      # wires modules
bot/src/handlers/commands.ts   # /start, menus
bot/src/handlers/search.ts     # text search + compare mode
bot/src/handlers/{ratings,calendar,judges,donino,favorites,dogs,comparison,guide}/
bot/wrangler.toml
.cursor/skills/bot-add-handler/
```

## Workflows

```bash
cd bot; yarn install
cd bot; yarn run build    # tsc — обязательно перед deploy
cd bot; yarn run test:run
cd bot; yarn run deploy   # manual
```

Webhook after deploy:
```
https://<worker>/set-webhook?secret=<WEBHOOK_SECRET>
```

Rate limit: ~100 req/min/user (ACK Telegram + user message). Input validation на handlers.

## Forbidden

- GitHub API как источник данных
- Полная история собаки
- Commit secrets
- Deploy без `yarn run build`
- Ломать CDN schema без согласования с сайтом
- Автодеплой бота в site CI без явного запроса

## See also

[10-security](10-security.md) · [12-agent-skills](12-agent-skills.md) · ADR-005
