# ADR-007: Exhibitions-RKF SQLite Migration

## Status
Accepted

## Date
2026-08-03
**Updated:** 2026-08-05 (Frontend migration to Turso completed)

## Context
Exhibitions-RKF data (51,430 JSON files, 1.38 GB) occupied significant disk space and became a maintenance burden. The data was derived from RKF PDF parsing and used for show statistics generation.

## Decision
Migrate exhibitions-rkf JSON files to SQLite with gzip compression for efficient storage and maintenance.

## Architecture
**Before:**
```
data/v1/shows/exhibitions-rkf/{year}/{id}.json (51,430 files, 1.38 GB)
  ↓ build-show-indexes.ts (filesystem read)
data/v1/shows/indexes/* (statistics)
```

**After (Backend):**
```
data/local/exhibitions-rkf-archive.sqlite (162.95 MB, 87.6% compression)
  ↓ build-show-indexes.ts (SQLite read via exhibitions-rkf-store.ts)
data/v1/shows/indexes/* (statistics)
```

**After (Frontend - 2026-08-05):**
```
Turso (51,429 rows, 189 MB)
  ↓ React Query (5-minute cache, direct Turso access)
Frontend (ShowCalendar, ShowRanking, ShowExhibitionDetail)
```

## Implementation

### Storage Interface
Created `backend/lib/exhibitions-rkf-store.ts` with `ExhibitionsRkfStore` interface:
- `read(id, year)` — read single exhibition from SQLite with decompression
- `listIds(year)` — list all exhibition IDs for a year
- `write(id, year, data)` — write exhibition with gzip compression

### Migration Script
Created `backend/scripts/migrate-exhibitions-rkf-to-sqlite.ts`:
- Reads all JSON files from exhibitions-rkf
- Compresses with gzip level 9
- Stores in SQLite with PRIMARY KEY (year, id)
- Verified data integrity across all years (2019-2026)

### Consumer Migration
Migrated the following scripts to use SQLite:
- `backend/scripts/build-show-indexes.ts` (root, called by build-all-data)
- `backend/scripts/build-show-indexes-by-year.ts`
- `backend/scripts/audit/*.ts` (diagnose-id-collisions.ts, check-id-collisions.ts, analyze-other-collision.ts)
- `backend/scripts/turso/import-to-turso.ts`

### Frontend Migration (2026-08-05)
**Problem:** After migration, JSON files were deleted but frontend still tried to read them. Exhibition protocols were broken.

**Solution:**
- Frontend now reads directly from Turso via @libsql/client
- Added pako library for gzip decompression from Turso BLOB
- Updated CSP to allow Turso requests
- React Query caching (5-minute staleTime) for all exhibition views
- ShowCalendar links all RKF exhibitions to /shows/exhibition/:id

**Files Changed:**
- `frontend/src/lib/staticData/shows.ts` - Turso integration
- `frontend/src/lib/turso.ts` - gzip decompression
- `frontend/src/pages/Shows/ShowCalendar.tsx` - links to local detail page
- `frontend/src/pages/Shows/ShowExhibitionDetail.tsx` - React Query caching
- `frontend/vite.config.ts` - CSP configuration

## Results
- **Storage:** 1.38 GB JSON → 189 MB SQLite (86% compression)
- **JSON files deleted:** 51,430 files removed from git repository
- **Frontend:** Direct Turso access with React Query caching (5-minute staleTime)
- **Performance:** Faster exhibition views, reduced Turso reads via caching

### Key Changes
- Added import: `import { getExhibitionsRkfStore } from '../lib/exhibitions-rkf-store'`
- Replaced filesystem read with SQLite store access
- Added guard for missing `results` arrays (SQLite data may not have results)
- Updated year range from [2016-2023] to [2016-2026] for full data coverage

## Benefits
- **Space savings:** 1.38 GB → 189 MB (86% reduction)
- **Performance:** SQLite index access faster than filesystem scanning
- **Maintainability:** Single SQLite file vs 51,430 individual files
- **Backup:** Easy to copy single SQLite file vs entire directory

## Trade-offs
- Dev workflow change: PDF parsing must write directly to SQLite instead of filesystem
- Frontend detail pages may need updates (currently skip index.json from SQLite)
- Additional complexity: exhibitions-rkf-store abstraction layer

## Rollback Strategy
If migration causes issues:
1. Restore exhibitions-rkf from backup (if available)
2. Revert build-show-indexes.ts to filesystem read
3. Revert other consumer scripts
4. Rebuild indexes

## Verification
- Byte-level verification passed for 50 sample files (100% match)
- build-all-data passes successfully
- Publish gates validation passes
- All years 2019-2026 verified in SQLite (no data loss)

## Related Decisions
- ADR-003: SQLite + JSON indexes (established SQLite usage)
- ADR-006: PDF processing optimization (source of exhibitions-rkf data)
