# CoursingStats Documentation

Documentation for the CoursingStats project — a static React site for dog competition statistics (coursing, BZMP, racing), RKF exhibitions, and Donino speed records.

## Quick Navigation

- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** — 5-minute overview, critical commands, common pitfalls
- **[MAP.md](MAP.md)** — detailed router for documentation (read this first for deep dive)
- **[STATUS.md](../tasks/STATUS.md)** — project status, active tasks, blocked issues
- **[INDEX.md](INDEX.md)** — quick links by category, document status matrix

## Structure

### docs/
- **sheets/** — 00-12 domain cheatsheets (overview, three domains, data pipeline, frontend, bot, etc.)
- **decisions/** — Architecture Decision Records (ADRs) — history of architectural choices
- **INDEX.md** — quick links and document status

### tasks/
- **STATUS.md** — unified project status
- **active/** — current tasks in progress
- **completed/** — finished tasks and audits
- **backlog/** — planned future work

## Getting Started

1. Read [QUICK-REFERENCE.md](QUICK-REFERENCE.md) for a 5-minute overview
2. Read [MAP.md](MAP.md) for detailed documentation routing
3. Check [STATUS.md](../tasks/STATUS.md) for current project state
4. Navigate to specific sheets or ADRs based on your needs

## Key Documentation

### Architecture
- [ADR-001: Cloudflare Pages Hosting](decisions/001-cloudflare-pages-hosting.md)
- [ADR-003: SQLite + JSON Indexes](decisions/003-sqlite-json-indexes.md)
- [ADR-009: Turso Migration](decisions/009-turso-migration.md)

### Domains
- [Sheet 01: Three Domains](sheets/01-three-domains.md) — Competitions, Shows, Donino
- [Sheet 02: Data Pipeline](sheets/02-data-pipeline.md) — data flow and build process
- [Sheet 03: Competitions](sheets/03-competitions.md) — coursing, BZMP, racing
- [Sheet 04: Shows](sheets/04-shows.md) — RKF exhibitions

### Development
- [Sheet 07: Frontend](sheets/07-frontend.md) — React + Vite + Tailwind
- [Sheet 08: Bot](sheets/08-bot.md) — Telegram bot (Cloudflare Workers)
- [Sheet 10: Security](sheets/10-security.md) — security best practices
- [Sheet 11: Testing](sheets/11-testing.md) — test coverage and strategy

## Project Status

Last verified: 2026-09-22

- ✅ All tests passing (backend 294, bot 83)
- ✅ Build pipeline working
- ✅ Data integrity verified
- ✅ Documentation up to date

See [STATUS.md](../tasks/STATUS.md) for detailed status and active tasks.
