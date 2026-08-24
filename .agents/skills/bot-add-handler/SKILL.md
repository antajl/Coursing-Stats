---
name: bot-add-handler
description: Add Telegram bot handlers for CoursingStats — Grammy, Workers, CDN, KV. Use when adding bot commands, keyboards, dog search, rankings in @coursing_stats_bot.
---

# Bot Handler Development

## Three domains in bot

| Domain | Bot features | CDN endpoints |
|--------|-------------|---------------|
| Competitions | Search, rankings, calendar, judges | dogs-index, dog-profiles, top-*, calendar |
| Shows | Show rankings, show calendar | shows/indexes/dog-ranking-*, shows/calendar |
| Donino | Speed records | donino/speed_records.json, coursing_records.json |

**Aggregates only** — no full dog history.  
**Identity:** competition `dog_id` ≠ show id ≠ Donino name+breed.

## Key files

```
bot/src/worker.ts                 # webhook secret + rate limit
bot/src/api.ts                    # CDN + KV
bot/src/keyboards.ts              # callback_data must match handlers
bot/src/handlers/index.ts         # wire new Composer here
bot/src/handlers/<feature>/       # one module per feature
bot/src/handlers/context.ts       # shared KVNamespace type
bot/wrangler.toml
```

## Adding a handler

1. Create `bot/src/handlers/<feature>/index.ts` with `createX(api, cache?)` returning `Composer`.
2. Register in `handlers/index.ts` via `bot.use(...)`.
3. Add buttons in `keyboards.ts` — **callback_data must match** the regex/string in the handler.
4. Prefer CDN indexes already used by the site; reuse `api.ts` methods or add one.
5. Validate input (`handlers/utils/validators.ts`).

## KV caching

- Index / ratings / records / shows / judges: 1h
- Calendar / search: 30min
- Dog profile: no long cache

## Before deploy

```bash
cd bot; yarn run build
cd bot; yarn run test:run
cd bot; yarn run deploy   # manual only
```

Docs: `docs/sheets/08-bot.md`, `docs/sheets/10-security.md`
