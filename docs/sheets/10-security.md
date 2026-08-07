---
title: Security
verified: 2026-08-06
---

# 10 — Security

## Purpose

Секреты, hardening бота и сайта, сканы.

## Truth table

| Область | Практика |
|---------|----------|
| Bot tokens | Cloudflare Workers secrets; never git |
| Local | `.env.ai`, `bot/.dev.vars` — gitignored; **не** коммитить |
| Webhook | secret token validation |
| Bot input | sanitize, length limits, format checks |
| Rate limit | ~100 req/min/user (KV) |
| Logging | structured security events (invalid input, rate limit, suspicious) |
| Site | static CDN; admin only local + token |
| Prefer yarn | npm на Windows даёт permission issues |

## Key files / cmds

```bash
yarn run security:scan
yarn audit
cd bot; yarn audit
cd frontend; yarn audit
```

- Bot: `bot/src/worker.ts`, handlers validation
- Auth site: local admin token header (`X-Admin-Token` pattern)

## Pitfalls

- Не логировать токены в debug на проде.
- Не класть secrets в `docs/` или skills.
- Ротация токена — через Cloudflare dashboard, не в репо.

## See also

[08-bot](08-bot.md) · [09-ops-deploy](09-ops-deploy.md) · global skill `security-and-hardening`
