---
title: Telegram Bot
verified: 2026-08-06
---

# 08 — Bot

## Purpose

`@coursing_stats_bot` — те же CDN данные, что сайт; Cloudflare Workers + Grammy + KV.

## Truth table

| Факт | |
|------|--|
| Runtime | Cloudflare Workers |
| Framework | Grammy |
| Data | `https://coursing-stats.ru/data/v1/...` |
| Secrets | `BOT_TOKEN`, `WEBHOOK_SECRET` (Workers secrets; `bot/.dev.vars` local) |
| Dog card | **aggregates only** — не дампить полную историю |
| Search | CDN + compact index; KV cache |
| Cron | daily `0 0 * * *` notifications |

### KV TTL (ориентир `bot/src/api.ts`)

| Key type | TTL |
|----------|-----|
| index / ratings / records / shows / judges / compact | 3600s |
| calendar / search results | 1800s |
| dog profile | 0 (no long cache) |

### CDN endpoints used

`indexes/dogs-index.json`, `bot-search-compact.json`, `dog-profiles/{id}.json`, `top-*`, `calendar/{year}`, `donino/*`, `shows/indexes/dog-ranking-{year}`, `judges-summary`, `shows/indexes/judges.json`

## Key files

```
bot/src/worker.ts
bot/src/api.ts
bot/src/handlers.ts
bot/src/keyboards.ts
bot/src/types.ts
bot/wrangler.toml
.cursor/skills/bot-add-handler/
```

## Workflows

```bash
cd bot; yarn run build    # tsc — обязательно перед deploy
cd bot; yarn test
cd bot; yarn run deploy
```

Rate limit: ~100 req/min/user. Input validation на handlers.

## Forbidden

- GitHub API как источник данных
- Полная история собаки
- Commit secrets
- Deploy без `yarn run build`
- Ломать CDN schema без согласования с сайтом

## See also

[10-security](10-security.md) · [12-agent-skills](12-agent-skills.md) · ADR-005
