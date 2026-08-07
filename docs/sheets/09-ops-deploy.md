---
title: Ops & Deploy
verified: 2026-08-06
---

# 09 — Ops & Deploy

## Purpose

Локальная разработка, CI, деплой Pages и бота, секреты, флаги календарей.

## Truth table

| Факт | |
|------|--|
| Package manager | **yarn@1.22.22** |
| Dev | `yarn run dev` → Vite `:5173` + admin `:8787` |
| Site deploy | `.github/workflows/deploy-frontend.yml` → `build-all-data` → Pages project `coursingstats` |
| Bot deploy | отдельно (`cd bot; yarn run deploy`); **не** Worker сайта в site CI |
| Calendar toggle | `data/v1/ui-flags.json` + `scripts/show-calendar-*.bat` / `hide-calendar-*.bat` |
| Secrets site/scripts | `.env.ai` (`TURSO_URL`, `TURSO_AUTH_TOKEN`) — gitignored |
| Secrets frontend | `VITE_TURSO_*` |
| Secrets bot | Cloudflare Workers secrets |
| Commit/push | только по явной просьбе пользователя |

## Key commands

```bash
yarn run dev
yarn run build-all-data
yarn test
yarn run publish-gates
yarn run security:scan
yarn run data:quick
yarn run perf:quick
cd bot; yarn run build; yarn test; yarn run deploy
```

PowerShell: `cd bot; yarn test` — не `&&`.

## Key files

- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/update-speed-records.yml`
- `package.json` scripts
- `data/v1/ui-flags.json`

## Git (кратко)

- Не force-push main; не `--no-verify` без просьбы
- Не коммитить `.env.ai`, `bot/.dev.vars`, токены
- ADR/why: [../decisions/](../decisions/)

## Pitfalls

- Docs с `npm run` — устарели, используй yarn.
- CI без local RKF не должен пересобирать show indexes «с нуля» в пустоту.
- После смены indexes — дождаться publish-gates.

## See also

[02-data-pipeline](02-data-pipeline.md) · [10-security](10-security.md) · [11-testing](11-testing.md)
