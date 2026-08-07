---
name: backend-scripts
description: Backend scripts registry and operational guide
triggers:
  - user
  - model
---

# Backend Scripts Registry

Comprehensive guide to all backend scripts for the Coursing Stats project.

## Quick Start

### Data Pipeline
```bash
yarn run build-all-data              # Full data pipeline (now in build-indexes/)
yarn run sync-sqlite-to-v1          # Sync SQLite to data/v1/
```

### Data Quality
```bash
yarn run audit-canonical-data        # Check data integrity
yarn run audit-duplicate-dogs        # Find duplicate dogs
yarn run audit-duplicate-events      # Find duplicate events
```

### Parser Testing
```bash
yarn run test-parser-fixtures        # Test parsers on real HTML
```

---

## Script Categories

### audit/ - Data Quality Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `analyze-other-collision.ts` | Analyze ID collisions in other fields | `npx tsx backend/scripts/audit/analyze-other-collision.ts` |
| `check-data-completeness.ts` | Verify data completeness across all sources | `npx tsx backend/scripts/audit/check-data-completeness.ts` |
| `check-id-collisions.ts` | Find duplicate IDs in database | `npx tsx backend/scripts/audit/check-id-collisions.ts` |
| `check-turso-progress.ts` | Check Turso migration progress | `npx tsx backend/scripts/audit/check-turso-progress.ts` |
| `compare-dog-names.ts` | Compare dog names across sources | `npx tsx backend/scripts/audit/compare-dog-names.ts` |
| `diagnose-id-collisions.ts` | Diagnose specific ID collision issues | `npx tsx backend/scripts/audit/diagnose-id-collisions.ts` |
| `verify-collision-fix.ts` | Verify collision fixes are working | `npx tsx backend/scripts/audit/verify-collision-fix.ts` |
| `verify-data-integrity.ts` | Verify overall data integrity | `npx tsx backend/scripts/audit/verify-data-integrity.ts` |

### build-derived/ - Index Generation Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `build-all-data.ts` | Full data pipeline (canonical) | `yarn run build-all-data` |
| `build-dog-indexes.ts` | Build dog search indexes | `npx tsx backend/scripts/build-derived/build-dog-indexes.ts` |
| `build-show-indexes.ts` | Build show indexes | `npx tsx backend/scripts/build-derived/build-show-indexes.ts` |
| `build-judges-indexes.ts` | Build judges indexes | `npx tsx backend/scripts/build-derived/build-judges-indexes.ts` |
| `shared.ts` | Shared utilities for index building | (library) |

### ci/ - CI-Specific Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `ci-sync-sqlite-to-v1.ts` | CI-optimized SQLite to v1 sync | Used in GitHub Actions |

### export/ - Data Export Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `export-json-to-sqlite.ts` | Export JSON data to SQLite | `npx tsx backend/scripts/export/export-json-to-sqlite.ts` |
| `export-to-sheets.ts` | Export data to Google Sheets | `npx tsx backend/scripts/export/export-to-sheets.ts` |
| `export-shows-for-turso.ts` | Export shows data for Turso migration | `npx tsx backend/scripts/export/export-shows-for-turso.ts` |

### import/ - Data Import Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `extract-1545-bib-colors.py` | Extract BIB colors from PDF (Python) | `python backend/scripts/import/extract-1545-bib-colors.py` |
| `import-events-from-html.ts` | Import events from HTML files | `npx tsx backend/scripts/import/import-events-from-html.ts` |
| `import-shows-from-sheets.ts` | Import shows from Google Sheets | `npx tsx backend/scripts/import/import-shows-from-sheets.ts` |
| `import-sheets-to-sqlite.ts` | Import Google Sheets to SQLite | `npx tsx backend/scripts/import/import-sheets-to-sqlite.ts` |

### load/ - Database Loading Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `load-events.ts` | Load events into database | `npx tsx backend/scripts/load/load-events.ts` |
| `load-shows.ts` | Load shows into database | `npx tsx backend/scripts/load/load-shows.ts` |
| `load-sqlite-to-v1.ts` | Load SQLite data to v1 format | `npx tsx backend/scripts/load/load-sqlite-to-v1.ts` |

### publish/ - Verification Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `verify-publish-gates.ts` | Verify data before publishing | Built into build-all-data |

### repair/ - Data Repair Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `fix-collisions-emergency.ts` | Emergency collision fixes | `npx tsx backend/scripts/repair/fix-collisions-emergency.ts` |
| `fix-show-breeds.ts` | Fix breed classifications in shows | `npx tsx backend/scripts/repair/fix-show-breeds.ts` |
| `repair-duplicate-dogs.ts` | Repair duplicate dog entries | `npx tsx backend/scripts/repair/repair-duplicate-dogs.ts` |
| `repair-duplicate-events.ts` | Repair duplicate event entries | `npx tsx backend/scripts/repair/repair-duplicate-events.ts` |

### reparse/ - Reparsing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `reparse-all-events.ts` | Reparse all events from HTML | `npx tsx backend/scripts/reparse/reparse-all-events.ts` |
| `reparse-all-shows.ts` | Reparse all shows from HTML | `npx tsx backend/scripts/reparse/reparse-all-shows.ts` |
| `reparse-coursing.ts` | Reparse coursing data | `npx tsx backend/scripts/reparse/reparse-coursing.ts` |
| `reparse-bzmp.ts` | Reparse BZMP data | `npx tsx backend/scripts/reparse/reparse-bzmp.ts` |
| `reparse-racing.ts` | Reparse racing data | `npx tsx backend/scripts/reparse/reparse-racing.ts` |
| `reparse-single-event.ts` | Reparse a single event | `npx tsx backend/scripts/reparse/reparse-single-event.ts` |
| `reparse-single-show.ts` | Reparse a single show | `npx tsx backend/scripts/reparse/reparse-single-show.ts` |

### scrape/ - Web Scraping Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scrape-website.ts` | Scrape website data | `npx tsx backend/scripts/scrape/scrape-website.ts` |

### seo/ - SEO Prerendering Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `prerender-bot-pages.ts` | Prerender bot pages for SEO | `npx tsx backend/scripts/seo/prerender-bot-pages.ts` |
| `prerender-site-pages.ts` | Prerender site pages for SEO | `npx tsx backend/scripts/seo/prerender-site-pages.ts` |

### shows/ - Show-Specific Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `build-show-indexes.ts` | Build show indexes | See build-derived/ above |
| `check-show-integrity.ts` | Check show data integrity | `npx tsx backend/scripts/shows/check-show-integrity.ts` |
| `fix-show-duplicates.ts` | Fix duplicate show entries | `npx tsx backend/scripts/shows/fix-show-duplicates.ts` |
| `import-shows-from-sheets.ts` | Import shows from sheets | See import/ above |
| `merge-shows-into-data.ts` | Merge shows into main data | `npx tsx backend/scripts/shows/merge-shows-into-data.ts` |
| `repair-show-breeds.ts` | Fix show breed classifications | See repair/ above |
| `sync-shows-to-v1.ts` | Sync shows to v1 format | `npx tsx backend/scripts/shows/sync-shows-to-v1.ts` |
| `update-show-rankings.ts` | Update show rankings | `npx tsx backend/scripts/shows/update-show-rankings.ts` |

### source/ - Source Management Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `manage-sources.ts` | Manage data sources | `npx tsx backend/scripts/source/manage-sources.ts` |

### speed/ - Donino Speed Records Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `export-speed-from-sheets.ts` | Export speed records from sheets | Used by update-donino.bat |
| `export-coursing-from-sheets.ts` | Export coursing records from sheets | Used by update-donino.bat |
| `speed-records-validation.ts` | Validate speed records data | `npx tsx backend/scripts/speed/speed-records-validation.ts` |
| `coursing-records-validation.ts` | Validate coursing records data | `npx tsx backend/scripts/speed/coursing-records-validation.ts` |
| `analyze-speed-trends.ts` | Analyze speed record trends | `npx tsx backend/scripts/speed/analyze-speed-trends.ts` |
| `compare-speed-records.ts` | Compare speed records across years | `npx tsx backend/scripts/speed/compare-speed-records.ts` |
| `update-speed-index.ts` | Update speed record index | `npx tsx backend/scripts/speed/update-speed-index.ts` |
| `merge-speed-records.ts` | Merge speed records from sources | `npx tsx backend/scripts/speed/merge-speed-records.ts` |
| `validate-speed-consistency.ts` | Validate speed record consistency | `npx tsx backend/scripts/speed/validate-speed-consistency.ts` |

### sync/ - Data Synchronization Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `sync-sqlite-to-v1.ts` | Sync SQLite database to v1 format | `yarn run sync-sqlite-to-v1` |
| `sync-shows-to-v1.ts` | Sync shows to v1 format | See shows/ above |
| `sync-turso-to-v1.ts` | Sync Turso database to v1 format | `npx tsx backend/scripts/sync/sync-turso-to-v1.ts` |

### test/ - Testing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `test-parsers.ts` | Test parser logic | Used by test-parser-fixtures |
| `test-data-integrity.ts` | Test data integrity checks | `npx tsx backend/scripts/test/test-data-integrity.ts` |
| `test-index-building.ts` | Test index building logic | `npx tsx backend/scripts/test/test-index-building.ts` |
| `test-show-data.ts` | Test show data processing | `npx tsx backend/scripts/test/test-show-data.ts` |
| `README.md` | Test documentation reference | See docs/ |

### update/ - Data Update Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `update-rankings.ts` | Update competition rankings | `npx tsx backend/scripts/update/update-rankings.ts` |
| `update-show-rankings.ts` | Update show rankings | See shows/ above |

---

## Root-Level Scripts (To Be Organized)

These scripts currently live at `backend/scripts/` root and should be moved to appropriate subdirectories:

**Audit scripts (move to audit/):**
- `analyze-other-collision.ts`
- `check-data-completeness.ts`
- `check-id-collisions.ts`
- `check-turso-progress.ts`
- `compare-dog-names.ts`
- `diagnose-id-collisions.ts`
- `verify-collision-fix.ts`
- `verify-data-integrity.ts`

**Repair scripts (move to repair/):**
- `fix-collisions-emergency.ts`
- `fix-show-breeds.ts`

**Test scripts (move to test/):**
- `verify-data-integrity.ts` (if used for testing)

---

## Common Patterns

### Data Pipeline Workflow
1. Parse source data (parsers)
2. Load into local SQLite (load/)
3. Validate data (audit/)
4. Build indexes (build-derived/)
5. Sync to v1 format (sync/)
6. Deploy to CDN (deploy-to-github.bat)

### Parser Development Workflow
1. Create/update parser in backend/parsers/
2. Test with test-parser-fixtures
3. Reparse affected data (reparse/)
4. Rebuild indexes (build-all-data)
5. Validate data integrity (audit/)
6. Deploy changes

### Data Quality Workflow
1. Run audit scripts (audit/)
2. Identify issues
3. Use repair scripts (repair/)
4. Verify fixes (verify-*)
5. Rebuild affected indexes
6. Deploy changes

---

## Prerequisites

- Node.js 22+ (recommended)
- yarn installed globally
- SQLite3 for local development
- Python 3+ for some import scripts
- Google Sheets API credentials for Donino updates

---

## Troubleshooting

### Common Issues

**Script fails with "file not found":**
- Check working directory (should be project root)
- Verify script path is correct
- Ensure dependencies are installed (`npm install`)

**Parser test failures:**
- Check HTML source files in data/local/
- Verify parser changes don't break existing tests
- Run individual parser tests first

**Data integrity issues:**
- Run `yarn run audit-canonical-data`
- Check specific audit scripts for details
- Use repair scripts to fix identified issues

**Build failures:**
- Check data/v1/ directory permissions
- Verify SQLite database is accessible
- Check memory availability for large builds

---

## Memory (What Worked)

- **build-all-data** is the canonical data pipeline
- **sync-sqlite-to-v1** is standard for database to v1 conversion
- **audit-canonical-data** catches most data quality issues
- **test-parser-fixtures** validates parser changes
- **repair-duplicate-dogs** handles duplicate resolution

## Memory (What Didn't)

- **Direct database edits** - always use scripts
- **Skipping build-all-data** after data changes
- **Mixing speed_records and coursing_records**
- **Ignoring audit script warnings**

---

## Open Questions

1. Should we organize remaining root-level scripts into subdirectories?
2. Can we automate script categorization?
3. Should we add script execution time estimates?
4. Can we create script dependency graphs?
5. Should we add script performance monitoring?
