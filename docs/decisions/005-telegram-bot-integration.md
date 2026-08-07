# ADR-005: Telegram Bot Integration

**Status:** Accepted  
**Date:** 2025-04-15  
**Context:** Need for mobile-friendly data access

## Context

Coursing Stats users needed a way to quickly access dog statistics and competition results:
- Mobile users prefer messaging apps over web
- Quick lookup without navigating website
- Push notifications for new results
- Easy sharing of dog profiles
- Offline access to cached data

## Decision

**Implemented Telegram bot** using Cloudflare Workers infrastructure.

### Architecture
1. **Bot Platform:** Telegram Bot API
2. **Infrastructure:** Cloudflare Workers (serverless)
3. **Data Access:** Same SQLite/JSON indexes as frontend
4. **Handlers:** Modular command handlers
5. **State:** Stateless (state stored in user sessions)

### Features Implemented
- Dog profile lookup by name
- Competition results
- Rankings and statistics
- Calendar of events
- Quick search functionality
- Inline mode for sharing

### Rationale

**Telegram Bot Advantages:**
- No mobile app development needed
- Uses existing Telegram infrastructure
- Serverless deployment (Cloudflare Workers)
- Low operational cost
- Familiar interface for users
- Bot API is well-documented and stable

**Rejected Alternatives:**
- **Mobile app:** High development cost, platform fragmentation
- **WhatsApp Business API:** More complex, higher costs
- **Discord bot:** Different user base, less mobile-friendly
- **SMS notifications:** High cost, limited functionality

## Consequences

### Positive
- Quick data access for mobile users
- No mobile app development needed
- Serverless deployment (low cost)
- Leverages existing Telegram user base
- Easy sharing and notifications
- Same data source as web app

### Negative
- Limited to Telegram users
- Bot API rate limits
- Dependency on Telegram platform
- Stateless architecture (limited session storage)
- Bot development complexity

### Implementation
- Cloudflare Workers for bot logic
- TypeScript for type safety
- Modular handler architecture
- Data access via same JSON indexes
- Deployed via `bot-deploy` skill
- Comprehensive error handling
- Documentation in docs/sheets/08-bot.md

## References

- Bot documentation: docs/sheets/08-bot.md
- Bot skills: .cursor/skills/bot-add-handler/SKILL.md
