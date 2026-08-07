# Coursing Stats Bot - TypeScript Version

Telegram bot for Coursing Stats, rewritten in TypeScript for Cloudflare Workers deployment.

## Features

### Core Functionality
- 🔍 Search dogs by name or ID (with minimum length validation)
- 🏆 View ratings (by score and placement, dynamic year selection)
- 📅 Competition calendar (current year)
- ⚡ Donino speed records (split into speed and coursing)
- 🎪 Shows/Exhibitions (yearly rankings)
- 👨‍⚖️ Judges (yearly rankings)
- ❤️ Favorites (save dogs to KV storage)
- 🌐 Direct links to coursing-stats.ru

### Technical Improvements
- 🛡️ Webhook protection with secret token
- ⚡ Cloudflare KV caching (index, ratings, calendar)
- 🔄 Lazy bot initialization (performance optimization)
- 📊 Dynamic year instead of hardcoded values
- 🎨 Old-money style with minimalist icons
- 📱 Improved UX: 2x2 main menu, helpful hints
- 🔄 Retry logic for API requests (3 attempts with exponential backoff)
- ✅ Type checking before deployment
- 🧪 Basic test coverage for API layer

## Tech Stack

- **Runtime:** Cloudflare Workers + KV
- **Language:** TypeScript
- **Framework:** Grammy (Telegram bot framework)
- **Testing:** Vitest
- **Deployment:** GitHub Actions → Cloudflare Workers
- **API:** Coursing Stats CDN

## Setup

### 1. Install Dependencies

```bash
cd bot-ts
yarn install
```

### 2. Configure Environment

Edit `wrangler.toml` and configure KV namespace:

```toml
[vars]
SITE_URL = "https://coursing-stats.ru"
WEBHOOK_SECRET = "your_webhook_secret"

[[kv_namespaces]]
binding = "CACHE"
id = "your_kv_namespace_id"
```

Set secrets for production:

```bash
wrangler secret put BOT_TOKEN
wrangler secret put WEBHOOK_SECRET
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create "CACHE"
```

Add the returned ID to `wrangler.toml`.

### 4. Local Development

```bash
yarn run dev
```

### 5. Run Tests

```bash
yarn run test:run
```

### 6. Deploy to Cloudflare

```bash
yarn run deploy
```

## GitHub Actions Deployment

The bot will be automatically deployed when you push to `main` branch.

### CI/CD Pipeline

The GitHub Actions workflow:
1. Checks out the repository
2. Sets up Node.js 20
3. Installs dependencies
4. Runs type checking (tsc --noEmit)
5. Builds TypeScript
6. Deploys to Cloudflare Workers

### Required Secrets

Add these secrets in GitHub repository settings:

- `CLOUDFLARE_API_TOKEN` - Get from Cloudflare Dashboard → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID` - Get from Cloudflare Dashboard → Workers & Pages
- `BOT_TOKEN` - Telegram bot token from BotFather
- `WEBHOOK_SECRET` - Random secret for webhook protection

## Project Structure

```
bot-ts/
├── src/
│   ├── worker.ts       # Cloudflare Worker entry point with lazy init
│   ├── handlers.ts     # Telegram bot handlers with favorites
│   ├── keyboards.ts    # Inline keyboards (2x2 menu, Donino split)
│   ├── icons.ts        # Unicode icons (old-money style)
│   ├── api.ts          # Coursing Stats API client with KV caching and retry logic
│   ├── types.ts        # TypeScript types
│   └── api.test.ts     # Unit tests for API layer
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions workflow
├── package.json
├── tsconfig.json
├── vitest.config.ts    # Vitest configuration
├── wrangler.toml
└── README.md
```

## API Integration

The bot uses the Coursing Stats CDN:

- **Main API:** `https://coursing-stats.ru/data/v1/`
- **Dogs Index:** `https://coursing-stats.ru/data/v1/indexes/dogs-index.json`
- **Shows:** `https://coursing-stats.ru/data/v1/shows/indexes/dog-ranking-{year}.json`
- **Judges:** `https://coursing-stats.ru/data/v1/indexes/judges-summary.json`
- **Show Judges:** `https://coursing-stats.ru/data/v1/shows/indexes/judges.json`

## Caching Strategy

- **Dogs Index:** 1 hour TTL
- **Ratings:** 1 hour TTL
- **Calendar:** 30 minutes TTL
- **Favorites:** Persistent in KV per user

## Retry Logic

API requests include automatic retry logic:
- 3 attempts with exponential backoff (1s, 2s, 3s delays)
- Caches successful responses
- Logs all attempts for debugging

## Webhook Setup

After first deployment, visit:
```
https://your-worker.workers.dev/set-webhook?secret=YOUR_WEBHOOK_SECRET
```

This will configure the Telegram webhook with secret token protection.

## Health Check

```
https://your-worker.workers.dev/health
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing types, install dependencies:
```bash
yarn install
```

### Test Failures

Run tests locally before pushing:
```bash
yarn run test:run
```

### Webhook Issues

If webhook isn't working, manually set it:
```bash
curl -F "url=https://your-worker.workers.dev/webhook" \
  -F "secret_token=YOUR_SECRET" \
  https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook
```

### KV Namespace Issues

Make sure KV namespace is created and ID is added to `wrangler.toml`:
```bash
wrangler kv:namespace list
```

### Cloudflare Deployment Issues

Make sure you have:
1. Valid `CLOUDFLARE_API_TOKEN` with Workers permissions
2. Correct `CLOUDFLARE_ACCOUNT_ID`
3. Worker name doesn't conflict with existing workers
4. KV namespace is properly configured

## Migration from Python

This is a TypeScript rewrite of the Python bot. Key differences:

- **Framework:** Grammy instead of aiogram
- **HTTP:** Native `fetch` instead of aiohttp
- **Runtime:** Cloudflare Workers instead of local Python
- **Deployment:** Automatic via GitHub Actions
- **Caching:** Cloudflare KV instead of in-memory
- **Security:** Webhook secret token protection
- **Testing:** Vitest instead of pytest

## Security

**Security Rating:** 8.5/10 (as of 2026-07-30)

- ✅ Webhook protected with secret token
- ✅ Bot token stored in Cloudflare secrets
- ✅ Lazy bot initialization for performance
- ✅ KV caching to reduce API load
- ✅ Input validation for search queries
- ✅ Type checking before deployment
- ✅ No legacy Python code in repository
- ✅ No debug logging in production code
- ✅ Structured logging via Cloudflare Observability
- ✅ Dependency security patches applied
- ✅ Error handling without information disclosure

**Security Documentation:** See [docs/sheets/10-security.md](../docs/sheets/10-security.md) and [docs/sheets/08-bot.md](../docs/sheets/08-bot.md).

## License

MIT
