# Documentation Index

Quick links to all CoursingStats documentation with status and last verification.

## Entry Points

| Document | Purpose | Last Verified |
|----------|---------|---------------|
| [README.md](README.md) | Documentation entry point | 2026-09-22 |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | 5-minute overview, critical commands | 2026-09-22 |
| [MAP.md](MAP.md) | Detailed documentation router | 2026-09-22 |
| [STATUS.md](../tasks/STATUS.md) | Project status, active tasks | 2026-09-22 |

## Domain Sheets (docs/sheets/)

All sheets verified 2026-09-22.

| Sheet | Topic | Key Content |
|-------|-------|-------------|
| [00-overview](sheets/00-overview.md) | Project overview | Architecture, tech stack, data flow |
| [01-three-domains](sheets/01-three-domains.md) | Three domains | Competitions, Shows, Donino boundaries |
| [02-data-pipeline](sheets/02-data-pipeline.md) | Data pipeline | Build process, canonical data, indexes |
| [03-competitions](sheets/03-competitions.md) | Competitions | Coursing, BZMP, racing, rankings |
| [04-shows](sheets/04-shows.md) | Shows | RKF exhibitions, Turso, protocols |
| [05-donino](sheets/05-donino.md) | Donino | Speed records, coursing records |
| [06-parsers](sheets/06-parsers.md) | Parsers | procoursing.ru, RKF PDF parsing |
| [07-frontend](sheets/07-frontend.md) | Frontend | React, Vite, Tailwind, routing |
| [08-bot](sheets/08-bot.md) | Bot | Telegram bot, Workers, Grammy |
| [09-ops-deploy](sheets/09-ops-deploy.md) | Operations | CI/CD, deployment, monitoring |
| [10-security](sheets/10-security.md) | Security | Security best practices |
| [11-testing](sheets/11-testing.md) | Testing | Test coverage, strategy |
| [12-agent-skills](sheets/12-agent-skills.md) | Agent skills | Project-specific skills |

## Architecture Decision Records (docs/decisions/)

| ADR | Topic | Status | Date |
|-----|-------|--------|------|
| [001](decisions/001-cloudflare-pages-hosting.md) | Cloudflare Pages Hosting | Accepted | 2025-01-01 |
| [002](decisions/002-react-query-data-fetching.md) | React Query for Data Fetching | Accepted | 2025-02-15 |
| [003](decisions/003-sqlite-json-indexes.md) | SQLite + JSON Indexes | Accepted | 2025-03-01 |
| [004](decisions/004-home-page-refactoring.md) | Home Page Refactoring | Accepted | 2026-08-01 |
| [005](decisions/005-telegram-bot-integration.md) | Telegram Bot Integration | Accepted | 2025-04-15 |
| [006](decisions/006-pdf-processing-optimization.md) | PDF Processing Optimization | Accepted | 2026-08-03 |
| [007](decisions/007-exhibitions-rkf-sqlite-migration.md) | Exhibitions-RKF SQLite Migration | Accepted | 2026-08-03 |
| [008](decisions/008-unified-event-structure.md) | Unified Event Structure | Proposed | 2026-08-03 |
| [009](decisions/009-turso-migration.md) | Turso Migration | Completed | 2026-08-03 |
| [010](decisions/010-automatic-rkf-monitoring.md) | Automatic RKF Calendar Monitoring | Proposed | 2026-08-04 |
| [012](decisions/012-typescript-strict-and-structured-logging.md) | TypeScript Strict and Structured Logging | Accepted | 2026-08-05 |
| [013](decisions/013-ai-readable-documentation-architecture.md) | AI-Readable Documentation Architecture | Accepted | 2026-08-05 |
| [014](decisions/014-cdn-packs-vs-turso.md) | CDN Packs vs Turso | Accepted | 2026-08-06 |

**Note:** ADR-011 (Unified SQLite Architecture with Admin System) was deleted (Rejected, contained 580 lines of unimplemented SQL schema).

## Tasks (tasks/)

| Task | Status | Priority |
|------|--------|----------|
| [STATUS.md](../tasks/STATUS.md) | Active | - |
| [active/code-quality.md](../tasks/active/code-quality.md) | Active | LOW/MEDIUM |
| [active/code-quality-todo.md](../tasks/active/code-quality-todo.md) | Active | LOW/MEDIUM |
| [completed/code-quality-audit-report.md](../tasks/completed/code-quality-audit-report.md) | Completed | - |
| [completed/code-quality-audit-plan.md](../tasks/completed/code-quality-audit-plan.md) | Completed | - |
| [completed/code-quality-audit-todo.md](../tasks/completed/code-quality-audit-todo.md) | Completed | - |
| [backlog/elo-calibration/](../tasks/backlog/elo-calibration/) | Backlog | - |

## Key Configuration Files

| File | Purpose |
|------|---------|
| [AGENTS.md](../AGENTS.md) | Agent entry point, forbidden patterns |
| [.devin/config.json](../.devin/config.json) | Devin configuration |
| [.mcp.json](../.mcp.json) | MCP server configuration |
| [package.json](../package.json) | Dependencies and scripts |
| [wrangler.toml](../wrangler.toml) | Cloudflare Workers configuration |

## Key README Files

| File | Location |
|------|----------|
| [bot/README.md](../bot/README.md) | Bot documentation |
| [frontend/README.md](../frontend/README.md) | Frontend documentation (if exists) |
| [backend/README.md](../backend/README.md) | Backend documentation (if exists) |

## Documentation by Category

### Architecture
- ADR-001: Cloudflare Pages Hosting
- ADR-003: SQLite + JSON Indexes
- ADR-009: Turso Migration
- ADR-014: CDN Packs vs Turso
- Sheet 01: Three Domains
- Sheet 02: Data Pipeline

### Frontend
- ADR-002: React Query for Data Fetching
- ADR-004: Home Page Refactoring
- Sheet 07: Frontend

### Backend
- Sheet 06: Parsers
- Sheet 09: Operations & Deploy

### Data
- ADR-006: PDF Processing Optimization
- ADR-007: Exhibitions-RKF SQLite Migration
- Sheet 03: Competitions
- Sheet 04: Shows
- Sheet 05: Donino

### Bot
- ADR-005: Telegram Bot Integration
- Sheet 08: Bot

### Quality
- ADR-012: TypeScript Strict and Structured Logging
- Sheet 10: Security
- Sheet 11: Testing

### Documentation
- ADR-013: AI-Readable Documentation Architecture
- Sheet 12: Agent Skills

## Proposed Future Work

From ADRs (Proposed status):
- ADR-008: Unified Event Structure — merge competitions and exhibitions into single structure
- ADR-010: Automatic RKF Calendar Monitoring — automated scraping and processing

## Last Modified Summary

- 2026-09-22: Documentation cleanup and reorganization (this work)
- 2026-08-24: Code quality audit completed
- 2026-08-06: ADR-014 (CDN Packs vs Turso)
- 2026-08-05: ADR-012 (TypeScript strict), ADR-013 (AI-readable docs)
- 2026-08-03: ADR-006 (PDF optimization), ADR-007 (SQLite migration), ADR-009 (Turso migration)
