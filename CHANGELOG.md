# Changelog

All notable changes to the CoursingStats project.

## [2026-09-22] About Page and Navigation Improvements

### Added
- `/about` page for project information
- Technical information section (Vite + React, Cloudflare Pages, CDN-only architecture)
- Implemented improvements section (SEO, Accessibility, Performance)
- GitHub repository link
- Version and license information
- "О проекте" link in desktop and mobile navigation
- `/about` in HUB_PAGES for SEO prerender
- `/about` in sitemap.xml
- Soft redirect for `/guide?tab=site` to "Соревнования" tab

### Changed
- Removed "О сайте" tab from Guide dropdown
- Updated `GUIDE_MENU_ITEMS` to exclude site tab
- Cleaned up Guide/index.tsx (removed SiteTab import and render)
- Deleted SiteTab.tsx component
- Navigation now has direct "О проекте" link instead of hidden tab
- Improved discoverability for external observers
- Separation of concerns: `/guide` for functionality, `/about` for project information

### Fixed
- Removed duplicate h1 header on `/about` page
- Updated prerender HTML to use empty h1 for cleaner SEO

### Related
- Navigation: Nav.tsx, NavDesktop.tsx, NavMobile.tsx
- Routes: AppRoutes.tsx
- SEO: prerender-html.ts, sitemap.ts
- Documentation: docs/sheets/07-frontend.md

## [2026-09-22] Documentation Cleanup

### Added
- `docs/README.md` — Documentation entry point
- `docs/QUICK-REFERENCE.md` — 5-minute overview, critical commands
- `docs/INDEX.md` — Quick links by category, document status matrix
- `tasks/STATUS.md` — Unified project status
- MCP server configuration (GitHub, Cloudflare, Cloudflare Docs)

### Changed
- Reorganized `tasks/` structure (active/completed/backlog)
- Moved improvement plans to `tasks/active/`
- Moved completed audits to `tasks/completed/`
- Moved ELO calibration to `tasks/backlog/`

### Removed
- `docs/decisions/011-turso-admin-system.md` — Rejected ADR with 580 lines of unimplemented SQL schema
- `tasks/todo.md` — Outdated backend consolidation plan (already completed)
- `tasks/plan.md` — Outdated backend consolidation plan (already completed)

### Related
- ADR-013: AI-Readable Documentation Architecture
- Code quality audit (2026-08-24)

## [2026-08-24] Code Quality Improvements

### Added
- Domain-specific skills for CoursingStats (9 skills in `.agents/skills/`)
- Development skills (14 skills in `.devin/skills/`)

### Changed
- Consolidated duplicate utility functions in backend
- Created `backend/lib/audit-utils.ts` with `walkJson` function
- Created `backend/lib/key-normalization.ts` with `normalizeKeyPart` function
- Created `backend/lib/show-normalization.ts` with `normalizeShowIdentity` function
- Removed ~150 lines of duplicate code
- Removed dead code and duplicate scripts
- Removed outdated skills directories

### Fixed
- `backend/scripts/build-all-data.ts` — Support for year-based show ranking files

### Related
- Commit: `refactor: remove dead code and duplicate scripts`
- Commit: `refactor/audit-utilities: consolidate duplicate functions`
- Commit: `refactor: eliminate code duplication and optimize performance`
- Code quality audit report

## [2026-08-06] CDN Packs Implementation

### Added
- ADR-014: CDN Packs vs Turso
- CDN packs for dog profiles (`dog-profiles/pack-*`)
- CDN packs for show judge details (`judge-details/pack-*`)

### Changed
- Turso usage restricted to exhibition protocols only
- Ranking and calendar data on CDN
- LC allowlist data on CDN

### Related
- ADR-014: CDN Packs vs Turso
- ADR-009: Turso Migration

## [2026-08-05] TypeScript and Logging Improvements

### Added
- ADR-012: TypeScript Strict and Structured Logging
- Structured logging in frontend (`frontend/src/lib/logging.ts`)
- JSDoc comments for critical functions

### Changed
- Enabled `noUnusedLocals` and `noUnusedParameters` in frontend TypeScript config
- Applied structured logging to AuthContext, DogProfileHeader, ErrorBoundary
- Integrated structured logging in backend error-tracker

### Related
- ADR-012: TypeScript Strict and Structured Logging
- Commit: `fix: improve code quality and security`

## [2026-08-05] AI-Readable Documentation

### Added
- ADR-013: AI-Readable Documentation Architecture
- `docs/MAP.md` — Documentation router
- `docs/sheets/` — 12 domain cheatsheets
- Consolidated documentation structure

### Changed
- Removed duplicate AI guide files
- Removed duplicate Git instruction files
- Consolidated security documentation
- Consolidated data architecture documentation

### Related
- ADR-013: AI-Readable Documentation Architecture

## [2026-08-05] Frontend Turso Integration

### Added
- Direct Turso access for exhibition protocols
- Pako library for gzip decompression from Turso BLOB
- React Query caching (5-minute staleTime) for exhibition views
- ShowExhibitionDetail page with Turso integration

### Changed
- Frontend now reads exhibition protocols directly from Turso
- CSP updated to allow Turso requests
- ShowCalendar links all RKF exhibitions to `/shows/exhibition/:id`

### Fixed
- Exhibition protocols restored after JSON deletion (ADR-007)

### Related
- ADR-009: Turso Migration
- ADR-007: Exhibitions-RKF SQLite Migration

## [2026-08-04] Automatic RKF Monitoring (Proposed)

### Proposed
- ADR-010: Automatic RKF Calendar Monitoring
- GitHub Actions workflow for every 6 hours
- Automatic PDF download and parsing
- Auto-sync to Turso

### Related
- ADR-010: Automatic RKF Calendar Monitoring
- ADR-006: PDF Processing Optimization

## [2026-08-03] Turso Migration

### Added
- ADR-009: Turso Migration
- Turso SQLite database for exhibitions-rkf (51,429 rows, 189 MB)
- GitHub Actions sync workflow for Turso
- `backend/scripts/turso/import-exhibitions-rkf.ts`

### Changed
- Exhibitions data migrated from local SQLite to Turso
- Frontend direct Turso access with React Query
- JSON export for exhibitions removed (size constraint)

### Related
- ADR-009: Turso Migration
- ADR-007: Exhibitions-RKF SQLite Migration

## [2026-08-03] Exhibitions SQLite Migration

### Added
- ADR-007: Exhibitions-RKF SQLite Migration
- `backend/lib/exhibitions-rkf-store.ts` storage interface
- `backend/scripts/migrate-exhibitions-rkf-to-sqlite.ts` migration script

### Changed
- Exhibitions data migrated from 51,430 JSON files (1.38 GB) to SQLite (189 MB)
- 86% storage reduction
- Build scripts updated to use SQLite store

### Related
- ADR-007: Exhibitions-RKF SQLite Migration
- ADR-006: PDF Processing Optimization

## [2026-08-03] PDF Processing Optimization

### Added
- ADR-006: PDF Processing Optimization
- `backend/scripts/auto-process-pdf.ts` automation script
- `--auto-process` flag for download script

### Changed
- Deleted historical PDF files (2019-2025) — freed ~22 GB
- Automatic processing of 2026 PDF files
- Immediate PDF deletion after JSON extraction

### Related
- ADR-006: PDF Processing Optimization
- Commit: freed ~24.5 GB total storage

## [2026-08-01] Home Page Refactoring

### Added
- ADR-004: Home Page Refactoring
- Custom hooks: `useHomeData.ts`, `useHeroScroll.ts`, `useRankingTab.ts`
- Components: `SeasonTopSection.tsx`, `DoninoRecordsSection.tsx`, `HomeFooter.tsx`
- Utilities: `formatters.ts`, `validators.ts`, `dataHelpers.ts`

### Changed
- Home.tsx reduced from 607 lines to 140 lines (77% reduction)
- Applied React.memo and useCallback for performance
- Added ARIA labels and keyboard navigation
- Implemented skeleton loading

### Related
- ADR-004: Home Page Refactoring
- Commit: Quality score improved from 8.5/10 to 9.4/10

## [2025-04-15] Telegram Bot Integration

### Added
- ADR-005: Telegram Bot Integration
- Cloudflare Workers + Grammy bot
- KV storage for favorites, compare mode, rate limits
- Modular Grammy Composers under `bot/src/handlers/`

### Features
- Dog lookup by name / ID
- Rankings (coursing medals/CS, racing speed, shows)
- Competition + show calendars
- Donino records
- Judges (competition ≠ show)
- Favorites, compare, guide, inline query, deep links

### Related
- ADR-005: Telegram Bot Integration
- Bot documentation: `docs/sheets/08-bot.md`

## [2025-03-01] SQLite + JSON Indexes

### Added
- ADR-003: SQLite + JSON Indexes
- SQLite database (pc-db.sqlite) as source of truth
- JSON indexes for common queries
- Python scripts for JSON generation

### Changed
- Data storage: SQLite (ACID compliance) + JSON indexes (CDN caching)
- Build pipeline: `npm run build-all-data` generates JSON indexes
- Frontend reads JSON indexes via static files

### Related
- ADR-003: SQLite + JSON Indexes
- Data workflow: `.devin/skills/data-workflow/SKILL.md`

## [2025-02-15] React Query Data Fetching

### Added
- ADR-002: React Query for Data Fetching
- `@tanstack/react-query` in frontend
- Query client configuration
- useQuery/useMutation hooks throughout app

### Changed
- Built-in caching and deduplication
- Automatic refetching strategies
- Optimistic updates support
- DevTools for debugging

### Related
- ADR-002: React Query for Data Fetching
- Frontend docs: `docs/sheets/07-frontend.md`

## [2025-01-01] Cloudflare Pages Hosting

### Added
- ADR-001: Cloudflare Pages Hosting
- Cloudflare Pages deployment for frontend
- Automatic deployment on push to `main` branch
- Preview deployments for pull requests

### Changed
- Hosting from local/VPS to Cloudflare Pages
- Custom domain: coursing-stats.ru
- Global CDN (200+ locations)
- Automatic SSL certificates

### Related
- ADR-001: Cloudflare Pages Hosting
- CI/CD rules: `.devin/rules/ci-cd-rules.mdc`

## Categories

- **Features** — New functionality
- **Fixes** — Bug fixes
- **Changed** — Changes to existing functionality
- **Added** — New files, documentation, configuration
- **Removed** — Deleted files, deprecated features
- **Related** — Related ADRs, commits, documentation
