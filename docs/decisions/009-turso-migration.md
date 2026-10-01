# ADR-009: Migrate to Turso SQLite for Exhibitions-RKF

**Status:** Completed (Frontend direct Turso access + caching)
**Date:** 2026-08-03
**Updated:** 2026-09-28 (Legacy issues removed — Turso working correctly)
**Decision:** Replace JSON CDN with Turso SQLite for exhibitions-rkf data

## Context

Current architecture (INTENDED):
|- Local SQLite (`exhibitions-rkf-archive.sqlite`, 189 MB) → JSON generation → CDN
|- Frontend reads JSON from Cloudflare Pages
|- Manual JSON regeneration after data changes

Problems:
|- Dual storage (SQLite + JSON)
|- Manual sync between local and prod
|- 5GB JSON vs 189 MB SQLite (96% waste)
|- No real-time updates

## Current State (VERIFIED 2026-09-28)

### Working Architecture:
1. **Exhibition protocols:** Frontend reads directly from Turso via `turso.ts` (getExhibitionById)
2. **Calendar & Ranking:** Frontend reads from CDN JSON (shows/calendar-rkf/, shows/indexes/dog-ranking-*.json)
3. **Turso integration:** Working correctly, using @libsql/client with pako gzip decompression
4. **CSP:** Configured to allow Turso requests
5. **React Query:** 5-minute caching for exhibition views

### Historical Issues (RESOLVED):
The "critical issues" mentioned in 2026-08-05 are no longer relevant:
- exhibitions-rkf-archive.sqlite: Local file not needed — Turso is the source of truth
- Turso sync workflow: Working correctly via manual trigger
- Frontend Turso access: Fully functional with proper error handling

## Decision

**IMPLEMENTED:** Frontend reads exhibition protocols directly from Turso; calendar/ranking remain on CDN JSON.

### Architecture (CURRENT - WORKING)

```
Frontend:
ShowCalendar → CDN JSON (shows/calendar-rkf/*.json)
ShowRanking → CDN JSON (shows/indexes/dog-ranking-*.json)
ShowExhibitionDetail → Turso (getExhibitionById with React Query caching)

Data Flow:
RKF PDF → Turso (import) → Frontend (direct access for protocols)
RKF Calendar → CDN JSON → Frontend (calendar)
```

### Implementation Details

**Completed:**
- ✅ Frontend reads from Turso via @libsql/client
- ✅ Pako gzip decompression for Turso BLOB data
- ✅ CSP configuration allows Turso requests
- ✅ React Query caching (5-minute staleTime) for exhibition views
- ✅ ShowCalendar links all RKF exhibitions to /shows/exhibition/:id

### Benefits

- Single database for exhibitions-rkf protocols
- Smaller storage footprint (189 MB vs 5 GB JSON)
- Better query flexibility (SQL vs JSON filtering)
- React Query caching reduces network requests
- Direct Turso access for exhibition protocols (CDN JSON for calendar/ranking)

### Data Access Pattern

**Before (JSON):**
```typescript
const response = await fetch('/data/v1/shows/exhibitions/10000.json')
const exhibition = await response.json()
```

**After (Turso):**
```typescript
import { getExhibitionById } from '../lib/turso'
const exhibition = await getExhibitionById('10000', 2021)
```

## Trade-offs

**Pros:**
- Single database for exhibitions-rkf protocols
- Smaller storage footprint (189 MB vs 5 GB JSON)
- Better query flexibility (SQL vs JSON filtering)
- React Query caching reduces network requests
- Calendar and ranking remain on CDN for performance

**Cons:**
- Dependency on Turso service for exhibition protocols
- Network latency for queries (mitigated by edge + caching)
- Environment variables management
- Competitions/Donino still use JSON (not migrated yet)

## Migration Steps

1. ✅ Import exhibitions-rkf to Turso (51,429 rows, 100%)
2. ✅ Create GitHub Actions sync workflow
3. ✅ Frontend Turso client (created, with React Query)
4. ✅ Update frontend to use Turso for exhibition protocols
5. ✅ Update documentation (ADR-009, AGENTS.md, wiki)
6. ✅ Test on production

## Rollback Plan

### Automatic Rollback (Built-in)
- exhibitions-adapter.ts has automatic JSON fallback
- 10% error rate triggers JSON fallback
- No manual intervention needed for Turso failures

### Manual Rollback Steps
1. If Turso is unstable: set `useFallback = true` in exhibitions-adapter.ts
2. If credentials leak: rotate Turso token in Cloudflare Pages
3. If quota exceeded: enable JSON fallback, increase Turso plan
4. Complete rollback: revert to JSON-only architecture

## References

- Turso: https://turso.tech
- @libsql/client: https://libsql.org
- Current storage: DATA-ARCHITECTURE-ANALYSIS.md
- Exhibitions migration: ADR-007
