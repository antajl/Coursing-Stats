# ADR-005: Telegram Bot Integration

**Status:** Accepted (updated 2026-08-07)  
**Date:** 2025-04-15  
**Context:** Need for mobile-friendly data access

## Context

Coursing Stats users needed a way to quickly access dog statistics and competition results:
- Mobile users prefer messaging apps over web
- Quick lookup without navigating website
- Easy sharing of dog profiles

Push notifications for new results were considered but are **not implemented**.

## Decision

**Implemented Telegram bot** using Cloudflare Workers + Grammy.

### Architecture
1. **Bot Platform:** Telegram Bot API (webhook + secret token header)
2. **Infrastructure:** Cloudflare Workers + KV
3. **Data Access:** Same CDN JSON as the public site (`/data/v1/...`) — no Worker/D1 runtime for data
4. **Handlers:** Modular Grammy Composers under `bot/src/handlers/`
5. **State:** KV for favorites, compare mode, rate limits, CDN cache

### Features Implemented
- Dog lookup by name / ID (aggregates only)
- Rankings (coursing medals/CS, racing speed, shows)
- Competition + show calendars
- Donino records
- Judges (competition ≠ show)
- Favorites, compare, guide, inline query, deep links

### Rationale

**Telegram Bot Advantages:**
- No mobile app development needed
- Serverless deployment (Cloudflare Workers)
- Low operational cost
- Same data source as web app

**Rejected Alternatives:**
- Mobile app, WhatsApp Business API, Discord bot, SMS

## Consequences

### Positive
- Quick mobile access
- Same CDN truth as the site
- Manual deploy keeps bot out of site CI blast radius

### Negative
- Limited to Telegram users
- Bot API rate limits
- No push notifications yet (would need cron + subscriber store)
- Handler/keyboard callback contracts need tests

### Implementation
- Deploy: `cd bot; yarn run build && yarn run test:run && yarn run deploy` (manual)
- Docs: `docs/sheets/08-bot.md`
- Skill: `.cursor/skills/bot-add-handler/SKILL.md`

## References

- Bot documentation: docs/sheets/08-bot.md
- Security: docs/sheets/10-security.md
- Bot skills: .cursor/skills/bot-add-handler/SKILL.md
