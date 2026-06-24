# Data Import Guide

## Overview
This guide covers the data import process for ProCoursing Stats application. Data is scraped from procoursing.ru and loaded into Cloudflare D1 database.

## Current Data State (Updated 2026-06-24)
- **Years available:** 2015-2026
- **Successfully imported:** 2023-2026 (4639 results total)
- **Data status:** 
  - 2015-2022: **NOT IMPORTABLE** - stored as images, requires OCR
  - 2023-2024: Static, successfully imported
  - 2025: Static, successfully imported  
  - 2026: Dynamic, successfully imported
- **Total events:** ~300+ events across 2023-2026
- **Total results:** 4639 dog results
  - 2023: 771 results (22 events)
  - 2024: 1086 results (27 events)
  - 2025: 1971 results (50 events)
  - 2026: 811 results (16 events)

## Data Import Scripts

### 1. Backfill Scripts
Located in `scripts/` directory:

- **`backfill-historical.mjs`** - Scrapes historical years (2015-2026) - **DEPRECATED**
- **`backfill-2023.mjs`** - Scrapes 2023 year specifically
- **`backfill-2024.mjs`** - Scrapes 2024 year specifically  
- **`backfill-2025.mjs`** - Scrapes 2025 year specifically
- **`backfill-2026.mjs`** - Scrapes only 2026 year with date filtering
- **`update-current-year.mjs`** - Incremental updates for current year

### 2. Load Scripts
- **`load-events.mjs`** - Converts events JSON to SQL
- **`load-results.mjs`** - Scrapes and loads results from event pages

### 3. Parser Scripts
- **`parse-results-coursing.mjs`** - Parses coursing results (supports multiple HTML formats)
- **`parse-results-bzmp.mjs`** - Parses BZMP results
- **`parse-results-racing.mjs`** - Parses racing results

## Import Process

### For Specific Years (2023-2026) - RECOMMENDED APPROACH
```bash
# For 2023 year
node scripts/backfill-2023.mjs
node scripts/load-events.mjs events-2023.json
npx wrangler d1 execute pc-db --local --file=./load-events.sql
node scripts/load-results.mjs events-2023.json
npx wrangler d1 execute pc-db --local --file=./load-results.sql

# For 2024 year
node scripts/backfill-2024.mjs
node scripts/load-events.mjs events-2024.json
npx wrangler d1 execute pc-db --local --file=./load-events.sql
node scripts/load-results.mjs events-2024.json
npx wrangler d1 execute pc-db --local --file=./load-results.sql

# For 2025 year
node scripts/backfill-2025.mjs
node scripts/load-events.mjs events-2025.json
npx wrangler d1 execute pc-db --local --file=./load-events.sql
node scripts/load-results.mjs events-2025.json
npx wrangler d1 execute pc-db --local --file=./load-results.sql

# For 2026 year (current year)
node scripts/backfill-2026.mjs
node scripts/load-events.mjs events-2026.json
npx wrangler d1 execute pc-db --local --file=./load-events.sql
node scripts/load-results.mjs events-2026.json
npx wrangler d1 execute pc-db --local --file=./load-results.sql
```

### For Historical Data (2015-2022) - NOT RECOMMENDED
```bash
# DO NOT USE - Data stored as images, requires OCR
# node scripts/backfill-historical.mjs
```

## Important Features

### HTML Format Variations by Year
Different years use different HTML structures on procoursing.ru:

- **2015-2022:** Results stored as images (JPG) - NOT parseable without OCR
- **2023-2024:** Simplified HTML tables (23 cells), catalog numbers as plain text
- **2025-2026:** Detailed HTML tables (25 cells), catalog numbers in `<i>` tags

### Parser Adaptation Strategy
The `parse-results-coursing.mjs` parser was adapted to handle multiple formats:

1. **Cell count detection:** Checks if table has 25 cells (2025-2026) or 23 cells (2023-2024)
2. **Catalog number extraction:** Handles both `<i>` tags and plain text numbers
3. **Score row filtering:** Filters out rows where name/breed are just numbers (summary rows)
4. **Simplified format handling:** For 2023-2024, extracts only total_score without detailed heat scores

### Date Filtering
Both `backfill-2026.mjs` and `load-events.mjs` filter events by date:
- Only events with `date_start <= current_date` are imported
- Prevents importing future/planned events
- Ensures data consistency with procoursing.ru

### Deduplication
The database uses `ON CONFLICT(results_url) DO UPDATE` to prevent duplicates:
- Events are uniquely identified by `results_url`
- Duplicate events update existing records instead of creating new ones
- Results are linked to events via foreign keys

### Event Types
Three main event types are supported:
- **coursing** - Coursing events
- **bzmp** - BZMP events  
- **racing** - Racing events

## Database Schema

### Events Table
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  date_start TEXT NOT NULL,
  date_end TEXT,
  rank_label TEXT,
  event_type TEXT NOT NULL,
  competition_kind TEXT,
  competition_type TEXT,
  title TEXT,
  host_club TEXT,
  region TEXT,
  location TEXT,
  catalog_url TEXT,
  results_url TEXT UNIQUE,
  confirmed INTEGER DEFAULT 0,
  last_modified TEXT,
  scraped_at TEXT DEFAULT (datetime('now'))
);
```

### Results Table
```sql
CREATE TABLE results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  dog_id INTEGER NOT NULL REFERENCES dogs(id),
  breed_class TEXT,
  catalog_no INTEGER,
  placement INTEGER,
  total_score REAL,
  qualification TEXT,
  vc TEXT,
  status TEXT DEFAULT 'finished',
  raw_scores_json TEXT,
  raw_text TEXT,
  UNIQUE(event_id, dog_id, breed_class)
);
```

### Dogs Table
```sql
CREATE TABLE dogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_lat TEXT NOT NULL,
  name_ru TEXT,
  breed TEXT,
  sex TEXT,
  pedigree_no TEXT,
  microchip TEXT,
  owner TEXT,
  pedigree_url TEXT,
  merged_into_dog_id INTEGER REFERENCES dogs(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(name_lat, breed)
);
```

## Common Issues and Solutions

### HTML Format Not Recognized
**Problem:** Parser returns 0 results for a specific year
**Solution:**
- Check HTML structure of results page for that year
- Verify cell count in table rows (23 vs 25 cells)
- Update `parse-results-coursing.mjs` to handle new format
- Add format detection logic based on cell count or URL pattern

### Catalog Number Extraction Fails
**Problem:** Parser cannot find catalog numbers, returns 0 results
**Solution:**
- Update `extractItalicNumber()` function to handle both `<i>` tags and plain text
- Add fallback logic: if no `<i>` tag, try extracting from plain text
- Check if catalog numbers are in different column positions

### Score Rows Mistaken as Dog Rows
**Problem:** Summary/total rows are parsed as dog results
**Solution:**
- Add validation: filter rows where name is just a number
- Add validation: filter rows where breed is just a number
- Check for specific patterns that indicate summary rows

### Duplicate Events
**Problem:** Events appear multiple times in database
**Solution:** 
- Clean duplicates: `DELETE FROM results WHERE event_id IN (SELECT id FROM events WHERE year = X)`
- Clean duplicates: `DELETE FROM events WHERE year = X`
- Re-import with date filtering enabled
- Check `results_url` uniqueness constraint

### Future Events Imported
**Problem:** Future/planned events appear in database
**Solution:**
- Date filtering is enabled in both scrape and load scripts
- Only events with `date_start <= current_date` are imported
- Verify current date calculation in scripts

### Missing Results
**Problem:** Events exist but no results loaded
**Solution:**
- Check if `results_url` is present in events table
- Verify parser for specific event type (coursing/bzmp/racing)
- Check network connectivity to procoursing.ru
- Verify HTML format matches parser expectations

### SQL Generation Issues
**Problem:** Results parsed but SQL not generated correctly
**Solution:**
- Check if results have required fields (total_score, placement)
- Update `load-results.mjs` to handle simplified format (2023-2024)
- Add fallback for results without detailed heat scores
- Verify SQL generation logic handles all result formats

## Server Management

### Starting Servers
Use `start.bat` to start both Worker and Frontend:
```bash
start.bat
```

This starts:
- Worker backend on http://127.0.0.1:8787
- Frontend on http://localhost:5173

**Important:** User manually runs servers via start.bat. Never auto-start Worker server.

### Database Operations
```bash
# Local database
npx wrangler d1 execute pc-db --local --command="SELECT COUNT(*) FROM events"

# Production database
npx wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) FROM events"

# Execute SQL file
npx wrangler d1 execute pc-db --local --file=./load-events.sql
```

## API Endpoints

### Events
- `GET /api/events` - All events
- `GET /api/events?year=2026` - Events by year
- `GET /api/events?breed=Уиппет` - Events by breed

### Dogs
- `GET /api/dogs/:id` - Dog profile with stats
- `GET /api/breeds` - All breeds
- `GET /api/years` - Available years

### Top Rankings
- `GET /api/top/placement` - Top by medals
- `GET /api/top/score` - Top by scores

Both support filters: `?breed=&year=&minStarts=`

## Maintenance

### Regular Updates
- **Historical data (2015-2022):** NOT UPDATABLE - stored as images
- **Historical data (2023-2024):** Static, no updates needed
- **Historical data (2025):** Static, no updates needed
- **Current year (2026):** Update as needed using `backfill-2026.mjs`
- **Frequency:** Weekly or after major events

### Data Verification
```bash
# Check total results by year
npx wrangler d1 execute pc-db --local --command="SELECT e.year, COUNT(*) as count FROM results r JOIN events e ON r.event_id = e.id GROUP BY e.year ORDER BY e.year"

# Check total events by year
npx wrangler d1 execute pc-db --local --command="SELECT year, COUNT(*) as count FROM events GROUP BY year ORDER BY year"

# Check for events without results
npx wrangler d1 execute pc-db --local --command="SELECT id, year, date_start, results_url FROM events WHERE results_url IS NOT NULL AND id NOT IN (SELECT DISTINCT event_id FROM results)"
```

### Backup
```bash
# Export local database
npx wrangler d1 export pc-db --local --output=backup.sql

# Export production database
npx wrangler d1 export pc-db --remote --output=backup.sql
```

## Troubleshooting

### Worker Server Issues
- Check if Worker is running on http://127.0.0.1:8787
- Verify D1 bindings in wrangler.toml
- Check CORS headers for API access

### Frontend Issues
- Check if Vite dev server is running on http://localhost:5173
- Verify API calls to Worker backend
- Check browser console for errors

### Data Inconsistency
- Compare with procoursing.ru source
- Check date filtering logic
- Verify parser output for specific events
- Use verification queries to check data integrity

## Best Practices for AI Agents

### When Importing Historical Data
1. **Always use year-specific scripts** - `backfill-YYYY.mjs` instead of generic historical script
2. **Test parser on single URL first** - Use CLI mode: `node parse-results-coursing.mjs <url>`
3. **Check HTML structure differences** - Different years may have different table structures
4. **Verify data before loading** - Check JSON output before generating SQL
5. **Use incremental approach** - Import year by year, verify each before moving to next

### When Adapting Parsers
1. **Add debug logging** - Log cell counts, extracted values to understand structure
2. **Handle multiple formats** - Use conditional logic based on cell count or URL patterns
3. **Filter invalid rows** - Add validation to filter out summary/total rows
4. **Provide fallbacks** - Handle cases where expected elements are missing
5. **Test on multiple pages** - Verify parser works across different events in same year

### When Troubleshooting
1. **Check database state first** - Verify what's actually in the database
2. **Test parser in isolation** - Run parser directly on problematic URLs
3. **Compare working vs broken** - Find differences between working and non-working pages
4. **Add temporary logging** - Add console.log to understand data flow
5. **Remove debug code after fixing** - Clean up before committing changes

### Critical Rules
- **NEVER auto-start Worker server** - User must manually run `start.bat`
- **ALWAYS use date filtering** - Prevent importing future events
- **ALWAYS use deduplication** - Prevent duplicate data in database
- **ALWAYS verify data integrity** - Check results after each import
- **ALWAYS document format changes** - Update docs when HTML structure changes
