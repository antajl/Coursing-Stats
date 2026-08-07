# Coursing Stats Bot

Telegram-бот `@coursing_stats_bot`: те же CDN-данные, что сайт. Cloudflare Workers + Grammy + KV.

## Возможности

- Поиск собак по кличке / ID (aggregates only)
- Рейтинги: курсинг (медали / очки CS), бега (`top-speed-*`), выставки
- Календарь соревнований и выставок
- Донино (скорость / 350m)
- Судьи (соревнования ≠ выставки)
- Избранное (KV), сравнение двух собак
- Справка, deep link `/start dog_{id}`, inline query

## Стек

- Runtime: Cloudflare Workers + KV
- Language: TypeScript
- Framework: Grammy
- Tests: Vitest
- Deploy: **вручную** (`yarn run deploy`)

## Setup

```bash
cd bot
yarn install
```

Секреты (prod):

```bash
wrangler secret put BOT_TOKEN
wrangler secret put WEBHOOK_SECRET
```

Локально: `bot/.dev.vars` (gitignored).

`wrangler.toml` — KV binding `CACHE`, `SITE_URL`.

```bash
yarn run dev          # wrangler dev
yarn run build        # tsc
yarn run test:run
yarn run deploy       # только по явной команде / после build+test
```

Webhook:

```
https://<worker>.workers.dev/set-webhook?secret=<WEBHOOK_SECRET>
```

Health: `GET /health`

## Структура

```
bot/
├── src/
│   ├── worker.ts           # entry: health, set-webhook, webhook+secret, rate limit
│   ├── api.ts              # CDN client + KV cache
│   ├── keyboards.ts
│   ├── icons.ts
│   ├── types.ts
│   ├── handlers/
│   │   ├── index.ts        # setupHandlers
│   │   ├── context.ts      # shared KVNamespace
│   │   ├── middleware.ts
│   │   ├── commands.ts
│   │   ├── search.ts
│   │   ├── ratings/
│   │   ├── calendar/
│   │   ├── judges/
│   │   ├── donino/
│   │   ├── favorites/
│   │   ├── dogs/
│   │   ├── comparison/
│   │   └── guide/
│   └── *.test.ts
├── wrangler.toml
├── package.json
└── README.md
```

## Кэш (KV)

| Данные | TTL |
|--------|-----|
| indexes / ratings / donino / shows / judges | 1h |
| calendar / search | 30min |
| dog profile | no long cache |
| favorites | 30 days |

## Безопасность

- Webhook: заголовок `X-Telegram-Bot-Api-Secret-Token` == `WEBHOOK_SECRET`
- Rate limit ~100 req/min/user
- Input validation (search / dog id / year)
- Токены только в Workers secrets / `.dev.vars`

Docs: [docs/sheets/08-bot.md](../docs/sheets/08-bot.md), [10-security.md](../docs/sheets/10-security.md).

## License

MIT
