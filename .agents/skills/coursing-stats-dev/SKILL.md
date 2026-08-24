---
name: coursing-stats-dev
description: >
  Основной рабочий процесс CoursingStats — только CDN, yarn build-all-data, локальная разработка,
  publish-gates, pre-push. Используй для общей работы с сайтом/бэкендом/данными, пустой рейтинг на проде,
  пересборка индексов.
  Main CoursingStats workflow — CDN-only, yarn build-all-data, local dev, publish-gates, pre-push.
  Use for general site/backend/data work, empty ranking on prod, indexes rebuild.
---

# CoursingStats — Development Workflow

## Three domains

Site has 3 sections: **Competitions**, **Shows**, **Donino** — see `three-domains` skill for identity boundaries.

## Architecture (30 seconds)

- Public site: static React SPA reads `/data/v1/*.json` from CDN — **no Worker/D1 in production**
- Single source of truth: `data/v1/` in git
- Admin panel: local only (`yarn run dev` → Vite :5173 + API :8787) — `/admin`, `/admin/event/:id`; Save → `data/v1/competitions` (+ ensure-dogs); then `build-all-data` for indexes/calendar aggregates
- Bot: Cloudflare Workers + Grammy, fetches same CDN JSON with KV cache
- Two separate ratings: **placement (medals)** ≠ **points (CS, cs-v1)** — never merge

## Entry docs (read order)

1. `AGENTS.md` → `docs/manifest.yaml` → `docs/index/topics.yaml`
2. `docs/MAP.md` → relevant `docs/sheets/*`
3. Task-specific sheets: `02-data-pipeline`, `07-frontend`, `09-ops-deploy`

## Critical commands

```bash
yarn run dev                  # Vite + admin API
yarn run build-all-data       # Rebuild indexes (required after data edits)
yarn run test                 # Vitest unit tests
yarn run test-parser-fixtures # Parser fixtures
yarn run publish-gates        # Pre-deploy validation
yarn run security:scan        # Security check
```

Bot (PowerShell — use `;` not `&&`):

```bash
cd bot; yarn run build
cd bot; yarn test
cd bot; yarn run deploy
```

## Forbidden (without explicit request)

- All breeds + 2015–2026 archive in UI
- Merge medals and points; change CS formula without `cs-v2`
- Runtime D1 in production
- Commit/push without user request
- Show full dog history in bot (aggregates only)

## Data pipeline

See [data-build-pipeline.md](data-build-pipeline.md) for full workflow and diagnostics.

## Done when

- `yarn run build-all-data` passes (if data/indexes changed)
- `yarn test` passes
- Parser tasks: `yarn run test-parser-fixtures` passes
