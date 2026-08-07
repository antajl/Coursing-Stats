# ADR-009: Migrate to Turso SQLite for Exhibitions-RKF

**Status:** Completed (Frontend direct Turso access + caching)
**Date:** 2026-08-03
**Updated:** 2026-08-05 (Exhibition protocols restored via direct Turso access)
**Decision:** Replace JSON CDN with Turso SQLite for exhibitions-rkf data

## Context

Current architecture (INTENDED):
- Local SQLite (`exhibitions-rkf-archive.sqlite`, 189 MB) → JSON generation → CDN
- Frontend reads JSON from Cloudflare Pages
- Manual JSON regeneration after data changes

Problems:
- Dual storage (SQLite + JSON)
- Manual sync between local and prod
- 5GB JSON vs 189 MB SQLite (96% waste)
- No real-time updates

## Current State (REAL DATA ANALYSIS - 2026-08-05)

### Critical Issues Resolved:
1. **Exhibition protocols restored via direct Turso access**
   - Frontend now reads directly from Turso (bypassing deleted JSON files)
   - Added pako library for gzip decompression from Turso BLOB
   - CSP updated to allow Turso requests
   - React Query caching (5-minute staleTime) for all exhibition views

2. **Frontend DOES read from Turso (exception to ADR-001)**
   - ShowRanking and ShowCalendar use @libsql/client with React Query
   - ShowExhibitionDetail now also uses React Query with Turso
   - Turso currently has 51,429 rows (189 MB)
   - This is CORRECT - exhibitions exceed 25 MB CDN limit

### Remaining Issues:
1. **exhibitions-rkf-archive.sqlite DOES NOT EXIST locally**
   - File not in data/local/ (gitignored directory)
   - Cannot verify local → Turso sync integrity
   - Must be restored from Turso or re-parsed from RKF PDFs
   - NOTE: Not blocking frontend since direct Turso access works

2. **Turso sync workflow is BROKEN**
   - Last run: 2026-08-03, FAILED with "@libsql/linux-x64-gnu" MODULE_NOT_FOUND
   - Trigger paths: data/local/** (gitignored) - cannot work via push
   - Workflow only triggers on manual workflow_dispatch
   - NOTE: Not blocking frontend since direct Turso access works

## Decision

**REVISED APPROACH:** Frontend reads directly from Turso (completed), local SQLite restoration deferred to ADR-011

### New Architecture (REVISED - IMPLEMENTED)

```
Frontend:
ShowCalendar → React Query → Turso (5-minute cache)
ShowRanking → React Query → Turso (5-minute cache)
ShowExhibitionDetail → React Query → Turso (5-minute cache) ✅ NEW

Data Flow:
RKF PDF → Turso (GitHub Actions sync) → Frontend (direct access)
```

### Implementation Details

**Completed:**
- ✅ Frontend reads from Turso via @libsql/client
- ✅ Pako gzip decompression for Turso BLOB data
- ✅ CSP configuration allows Turso requests
- ✅ React Query caching (5-minute staleTime) for all views
- ✅ ShowCalendar links all RKF exhibitions to /shows/exhibition/:id

**Deferred to ADR-011:**
- 🔄 Restore local exhibitions-rkf-archive.sqlite
- 🔄 Fix Turso sync workflow (@libsql/linux-x64-gnu error)
- 🔄 Implement local SQLite canon + JSON export pipeline

[INTENDED ARCHITECTURE]
Local exhibitions-rkf-archive.sqlite
        ↓
GitHub Actions: sync-turso.yml (manual trigger only)
        ↓
Turso SQLite (Edge database)
        ↓
Frontend: Direct SQL queries via @libsql/client
```

### Benefits

- **Single source of truth**: Turso is the only database (after fixes)
- **Smaller storage**: 189 MB SQLite vs 5GB JSON
- **Real-time updates**: No manual deploys (after sync fixed)
- **Better performance**: Edge replication, fast queries
- **Free tier**: 5GB storage, 500M reads, 10M writes/month

### Implementation (REVISED)

1. **[CRITICAL] Restore local SQLite file**
   - Option A: Export from Turso to local SQLite
   - Option B: Re-parse RKF PDFs (if Turso export fails)
   - Verify file integrity (189 MB, 51,429 rows)

2. **[CRITICAL] Fix Turso sync workflow**
   - Resolve "@libsql/linux-x64-gnu" MODULE_NOT_FOUND error
   - Update trigger paths (data/local/** is gitignored)
   - Test sync with manual workflow_dispatch trigger

3. **Import exhibitions-rkf to Turso** (ALREADY DONE)
   - Used `backend/scripts/turso/import-exhibitions-rkf.ts`
   - 51,429 rows imported successfully
   - Verified with `check-turso.ts`

4. **Frontend integration** (ALREADY DONE)
   - Installed `@libsql/client`
   - Created `frontend/src/lib/turso/exhibitions-adapter.ts`
   - Replaced JSON fetch with SQL queries for ShowRanking/ShowCalendar
   - Environment variables: `VITE_TURSO_URL`, `VITE_TURSO_AUTH_TOKEN`
   - React Query with JSON fallback for resilience

5. **Update workflow** (BROKEN - needs fix)
   - Local: Edit SQLite → `git push` → MANUAL sync to Turso (workflow_dispatch)
   - Frontend: Direct SQL queries to Turso for exhibitions-rkf
   - Competitions/Donino: Continue using JSON (not migrated yet)

6. **React Query migration** (ALREADY DONE)
   - Replace useEffect with useQuery in ShowRanking and ShowCalendar
   - Automatic caching with 5-minute staleTime
   - Error handling with JSON fallback

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
- Single database for exhibitions-rkf, no sync issues
- Automatic CI/CD sync for exhibitions-rkf
- Smaller storage footprint (189 MB vs 5 GB JSON)
- Better query flexibility (SQL vs JSON filtering)
- React Query caching reduces network requests
- Automatic RKF calendar monitoring

**Cons:**
- Dependency on Turso service for exhibitions-rkf
- Network latency for queries (mitigated by edge + caching)
- Environment variables management
- Competitions/Donino still use JSON (not migrated yet)
- Breaking change for exhibitions-rkf frontend

## Migration Steps

1. ✅ Import exhibitions-rkf to Turso (51,429 rows, 100%)
2. ✅ Create GitHub Actions sync workflow
3. ✅ Frontend Turso client (created, with React Query)
4. ✅ Update frontend to use Turso (ShowRanking + ShowCalendar)
5. 🔄 Remove exhibitions/ JSON generation (not yet - need stable period)
6. ✅ Update documentation (ADR-009, AGENTS.md, wiki)
7. ⏳ Test on production (needs Cloudflare Pages env vars)
8. 📋 Competitions migration (planned for future)
9. 📋 Donino migration (planned for future)

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

### Rollback Verification
- Monitor read error rate in Turso
- Check that JSON fallback works when Turso fails
- Verify no data loss during rollback
- Confirm performance with JSON fallback

## References

- Turso: https://turso.tech
- @libsql/client: https://libsql.org
- Current storage: DATA-ARCHITECTURE-ANALYSIS.md
- Exhibitions migration: ADR-007
