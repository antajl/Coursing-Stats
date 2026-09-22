# CoursingStats Quick Reference

5-minute overview of the CoursingStats project.

## What is CoursingStats?

Static React site for dog competition statistics:
- **Competitions:** Coursing, BZMP, racing (procoursing.ru)
- **Shows:** RKF exhibitions (rankings, calendars, protocols)
- **Donino:** Speed measurements and 350m coursing records
- **Bot:** Telegram bot (@coursing_stats_bot)

## Architecture

### Three Domains
1. **Competitions** — procoursing.ru data, calendars, protocols, rankings (medals, CS points, Elo)
2. **Shows** — RKF exhibitions, Turso for large protocols, CDN for rankings
3. **Donino** — Speed records, separate dog identity

### Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS (Cloudflare Pages)
- **Backend:** Node.js + TypeScript + SQLite (local dev only)
- **Bot:** Cloudflare Workers + Grammy + KV
- **Data:** JSON in `data/v1/` (canonical source in git) + Turso for exhibitions
- **Package Manager:** yarn@1.22.22

### Deployment
- **Public site:** Cloudflare Pages (CDN-only, no Worker/D1 runtime)
- **CDN root:** `https://coursing-stats.ru/data/v1/`
- **Bot:** Manual deploy to Cloudflare Workers
- **Repository:** `antajl/Coursing-Stats`

## Critical Commands

### Development
```bash
# Install dependencies
yarn install

# Run backend tests
yarn test

# Run bot tests
cd bot
yarn run vitest run

# Build all data
yarn run build-all-data

# Start frontend dev server
cd frontend
yarn run dev
```

### Bot Deployment
```bash
cd bot
yarn run build
yarn run test:run
yarn run deploy  # Manual only
```

## Data Flow

```
procoursing / Google Sheets / RKF PDF
    → data/v1/ (canonical in git)
    → build-all-data
    → generated indexes
    → Cloudflare Pages CDN
```

## Common Pitfalls

### 1. Dog Identity Across Domains
- **WRONG:** Assume numeric ID equality between competition and show dogs
- **RIGHT:** Use explicit mappings (competition_dog_id, dog_links, stable project logic)
- **Skill:** `sport-show-linkage` — always use when linking sport↔show dogs

### 2. CDN vs Turso Violations
- **WRONG:** Reading ranking/calendar from Turso
- **RIGHT:** Only exhibition protocols from Turso, everything else from CDN
- **Reason:** Production is CDN-only, no Worker/D1 runtime

### 3. Merging Ratings
- **WRONG:** Merge medals, CS points, Elo into composite (0.4*Elo + 0.3*CS + …)
- **RIGHT:** Keep separate: top-placement-*, top-score-*, top-elo-*, top-speed-*

### 4. Show Ranking Validation
- **Current:** Year-based files (dog-ranking-2017.json, dog-ranking-2018.json, etc.)
- **NOT:** Monolithic dog-ranking.json or numeric shards (dog-ranking-01.json)

## Emergency Procedures

### Build Failure
```bash
# 1. Check data integrity
yarn run build-all-data

# 2. Run tests
yarn test

# 3. Check git status
git status
```

### Bot Issues
```bash
# Check bot health
curl https://<worker>.workers.dev/health

# View logs in Cloudflare Dashboard
```

### Data Issues
```bash
# Rebuild show year
cd backend
npx tsx scripts/repair/rebuild-show-year.ts --year=2026

# Rebuild exhibition snapshot
npx tsx scripts/repair/rebuild-show-snapshot.ts
```

## Key Files

### Configuration
- `.devin/config.json` — Devin configuration
- `.mcp.json` — MCP server configuration (GitHub, Cloudflare)
- `package.json` — dependencies and scripts

### Data
- `data/v1/manifest.json` — project statistics
- `data/v1/calendar/` — competition calendars
- `data/v1/competitions/` — competition protocols
- `data/v1/shows/` — exhibition data
- `data/v1/donino/` — speed records

### Scripts
- `backend/scripts/build-all-data.ts` — main data build pipeline
- `backend/scripts/shows/download-rkf-reports.ts` — RKF PDF download
- `backend/scripts/auto-process-pdf.ts` — PDF processing automation

## Documentation

- **[MAP.md](MAP.md)** — Detailed documentation router
- **[STATUS.md](../tasks/STATUS.md)** — Project status and active tasks
- **[AGENTS.md](../AGENTS.md)** — Agent instructions and forbidden patterns

## Skills

Project-specific skills (auto-activated by context):
- `three-domains` — routing across Competitions/Shows/Donino
- `competitions-domain` — competitions-specific logic
- `shows-domain` — exhibitions-specific logic
- `donino-domain` — Donino-specific logic
- `sport-show-linkage` — safe dog identity linking
- `coursing-stats-parsers` — procoursing.ru parsers
- `shows-pdf-pipeline` — RKF PDF processing

Global skills (auto-activated):
- `ponytail` — lazy development, YAGNI
- `verification-before-completion` — verify before claiming done
- `test-driven-development` — TDD methodology
- `debugging-and-error-recovery` — systematic debugging

## Last Verified

2026-09-22 — All systems operational, tests passing, data integrity verified.
