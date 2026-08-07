# ADR-011: Unified SQLite Architecture with Admin System

## Status
**Rejected** (2026-08-05) - Partial implementation only (Phase 0)

## Context
Originally proposed unified SQL format for all data:
- Собаки должны быть идентичны между соревнованиями и выставками (один и тот же реестр)
- Всё что не касается выставок (competitions, donino, judges) — SQL файлы в git → Cloudflare D1
- Выставки — в Turso (189 MB > 25 MB CDN limit)
- Audit trail для всех изменений
- Возможность точечных изменений через admin API

## Decision

**REJECTED:** Modular SQL files + D1 for frontend reading

### Reasons for Rejection

1. **D1 incompatible with CDN-only architecture**
   - Cloudflare D1 requires Worker for binding (`env.DB.prepare(...)`)
   - Direct browser access to D1 is not possible (unlike Turso with public HTTP API)
   - Worker deployment is prohibited by ADR-001 and wrangler.toml
   - Production = static Pages only, no server-side runtime

2. **Modular SQL files lose FK integrity**
   - dogs.sqlite ↔ competitions.sqlite cannot have normal FK relationships
   - Requires ATTACH DATABASE + manual foreign_keys configuration
   - Undermines the main benefit of SQL (referential integrity)

3. **JSON+CDN already solves reading use case**
   - Frontend already reads JSON from CDN successfully
   - Build artifacts (dog-ranking, indexes) are pre-computed for specific views
   - No need for arbitrary SQL queries on frontend
   - SQLite in browser (WASM) adds complexity without benefits

4. **Project size is manageable**
   - Initial 10 GB concern was resolved by cleaning build artifacts
   - 8.2 GB → 4.18 GB after removing year-data, build outputs, duplicates
   - data/v1 = 2.01 GB (acceptable for this project scale)

## What Was Implemented (Phase 0 Only)

### Completed 2026-08-05

1. **Fixed Turso sync workflow**
   - Removed `data/local/**` from trigger paths (gitignore, never triggers push)
   - Now triggers only on `backend/scripts/turso/**` and manual workflow_dispatch
   - Commit: 968dfcce

2. **Restored exhibitions-rkf-archive.sqlite locally**
   - Created `backend/scripts/turso/export-from-turso.ts`
   - Exported 51,429 rows from Turso to local SQLite (189 MB)
   - Enables local build-show-indexes with exhibitions data
   - Commit: 0107ca76

3. **Verified data consistency**
   - build-show-indexes works with local SQLite
   - 606,003 dogs in dog-details
   - All indexes successfully built

### Current State (2026-08-05)

- **Exhibitions:** Turso (51,429 rows, 189 MB) ✅ Working
- **Competitions:** JSON (24 MB) ✅ Working
- **Donino:** JSON (~50 KB) ✅ Working
- **Dog profiles:** JSON (~2 MB) ✅ Working
- **Judges:** JSON (<100 KB) ✅ Working
- **Local SQLite:** exhibitions-rkf-archive.sqlite (189 MB) ✅ Restored

## Alternative Approach (Not Implemented)

If SQL + audit trail is needed in future, consider:

**One local SQLite canon (not modular):**
- Single file with all tables (dogs, events, results, judges, donino)
- Normal FK relationships within one file
- Admin API writes to canon
- build-all-data reads canon → generates JSON for CDN
- Frontend reads JSON from CDN (unchanged)
- Exhibitions remain in Turso (size constraint)

This preserves FK integrity and audit trail while maintaining CDN-only frontend architecture.

## Rejected Components

- ❌ Modular SQL files (dogs.sqlite, competitions.sqlite, donino.sqlite, judges.sqlite)
- ❌ Cloudflare D1 for frontend reading (incompatible with CDN-only architecture)
- ❌ Migration of competitions/donino/judges to SQL (no benefit, adds complexity)

## See Also

- ADR-001: Cloudflare Pages hosting (CDN-only architecture decision)
- ADR-007: Exhibitions-RKF SQLite migration (local → Turso)
- ADR-009: Turso migration (exhibitions in Turso with frontend direct access)
   - Trigger paths: data/local/** (gitignored) - cannot work via push
   - Workflow only triggers on manual workflow_dispatch

3. **Frontend DOES read from Turso for exhibitions** (CORRECT)
   - ShowRanking and ShowCalendar use @libsql/client
   - ShowExhibitionDetail now also uses @tanstack/react-query with Turso
   - React Query with 5-minute staleTime for all views
   - This is CORRECT - exhibitions exceed 25 MB CDN limit

4. **Exhibition protocols issue RESOLVED (2026-08-05)**
   - ✅ Exhibition protocols restored via direct Turso access
   - ✅ Frontend reads from Turso with pako gzip decompression
   - ✅ CSP updated to allow Turso requests
   - ✅ ShowCalendar links all RKF exhibitions to /shows/exhibition/:id
   - ✅ React Query caching (5-minute staleTime) reduces Turso reads

## Decision

### Architecture: Modular SQL Files + Turso for Exhibitions + Unified Dog Registry

**Core Principle:** Всё в формате SQL, exhibitions в Turso (size constraint), dogs unified across sport and exhibitions.

**Components:**
1. **dogs.sqlite** - unified dog registry (links sport + exhibitions)
2. **competitions.sqlite** - competitions data
3. **donino.sqlite** - donino speed/coursing records
4. **judges.sqlite** - judges data
5. **exhibitions.sqlite** - exhibitions data (local + sync to Turso)
6. **Admin API** - writes to SQLite files instead of JSON
7. **Cloudflare D1** - serves SQL files for competitions/donino/judges/dogs
8. **Turso** - serves exhibitions only (189 MB > 25 MB CDN limit)
9. **Audit Trail** - automatic triggers in SQLite files
10. **JSON Export** - optional for CDN backup/compatibility

**Data Flow:**
```
Parser → in-memory object → SQLite files (WRITE)
       ↓
    Admin API → SQLite files (WRITE)
       ↓
    dogs.sqlite → unified dog registry (sport + exhibitions)
       ↓
    exhibitions.sqlite → Turso sync (manual trigger)
       ↓
    Cloudflare D1: serves competitions/donino/judges/dogs (from SQL files)
       ↓
    Turso: serves exhibitions (from sync)
```

**Key Corrections from Original Plan:**
- ❌ NO "single unified SQLite file" - modular SQL files by topic
- ❌ NO "SQLite canon in git" - SQLite files in git → Cloudflare D1
- ❌ NO "JSON export for CDN" - SQL files → Cloudflare D1 directly
- ✅ Exhibitions in Turso (size constraint respected)
- ✅ Unified dog registry (links sport + exhibitions)
- ✅ All data in SQL format (as requested)
- ✅ Small SQL files in git → Cloudflare D1 (competitions/donino/judges)

## Enhanced Database Schema (Modular)

### 1. dogs.sqlite - Unified Dog Registry

```sql
-- Dogs (unified for competitions + exhibitions)
CREATE TABLE IF NOT EXISTS dogs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name_lat        TEXT NOT NULL,
  name_ru         TEXT,
  breed           TEXT,
  sex             TEXT,               -- 'M' | 'F'
  pedigree_no     TEXT,
  microchip       TEXT,
  owner           TEXT,
  pedigree_url    TEXT,
  merged_into_dog_id INTEGER REFERENCES dogs(id),
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  updated_by      TEXT,
  UNIQUE(name_lat, breed)
);

CREATE INDEX idx_dogs_breed ON dogs(breed);
CREATE INDEX idx_dogs_name_lat ON dogs(name_lat);

-- Audit log for dogs
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL,           -- 'INSERT', 'UPDATE', 'DELETE'
  old_values TEXT,                   -- JSON (for UPDATE/DELETE)
  new_values TEXT,                   -- JSON (for INSERT/UPDATE)
  changed_at TEXT DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL,
  reason TEXT                        -- optional reason for change
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_date ON audit_log(changed_at);
```

### 2. competitions.sqlite - Competitions Data

```sql
-- Events (competitions only)
CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  year          INTEGER NOT NULL,
  date_start    TEXT NOT NULL,
  date_end      TEXT,
  rank_label    TEXT,
  event_type    TEXT NOT NULL,        -- 'coursing' | 'bzmp' | 'racing'
  competition_kind TEXT,
  competition_type TEXT,
  title         TEXT NOT NULL,
  host_club     TEXT,
  region        TEXT,
  location      TEXT,
  catalog_url   TEXT,
  results_url   TEXT UNIQUE,
  confirmed     INTEGER DEFAULT 0,
  last_modified TEXT,
  scraped_at    TEXT DEFAULT (datetime('now')),
  telegram_url  TEXT,
  full_title    TEXT,
  event_date    TEXT,
  protocol_location TEXT,
  judges        TEXT,                 -- JSON array judge objects
  track_schemes TEXT,                 -- JSON array track schemes
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now')),
  created_by    TEXT,
  updated_by    TEXT,
  UNIQUE(date_start, title, location, event_type)
);

CREATE INDEX idx_events_year ON events(year);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_date_start ON events(date_start);

-- Results (competitions only)
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  dog_id INTEGER NOT NULL REFERENCES dogs(id),  -- foreign key to dogs.sqlite (via import)
  breed TEXT,
  sex TEXT,
  owner TEXT,
  handler TEXT,
  group_placement TEXT,
  total_score REAL,
  avg_judge_score REAL,
  best_judge_score REAL,
  total_starts INTEGER,
  judge_eval_count INTEGER,
  rating_score REAL,
  qualification TEXT,
  disqualified INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT,
  UNIQUE(event_id, dog_id)
);

CREATE INDEX idx_results_event ON results(event_id);
CREATE INDEX idx_results_dog ON results(dog_id);
CREATE INDEX idx_results_breed ON results(breed);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL,
  reason TEXT
);
```

### 3. donino.sqlite - Donino Speed/Coursing Records

```sql
-- Speed records
CREATE TABLE IF NOT EXISTS speed_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER NOT NULL REFERENCES dogs(id),
  breed TEXT,
  speed REAL NOT NULL,
  distance REAL NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  screenshot_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX idx_speed_dog ON speed_records(dog_id);
CREATE INDEX idx_speed_breed ON speed_records(breed);

-- Coursing records
CREATE TABLE IF NOT EXISTS coursing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER NOT NULL REFERENCES dogs(id),
  breed TEXT,
  score REAL NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  screenshot_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX idx_coursing_dog ON coursing_records(dog_id);
CREATE INDEX idx_coursing_breed ON coursing_records(breed);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL,
  reason TEXT
);
```

### 4. judges.sqlite - Judges Data

```sql
-- Judges
CREATE TABLE IF NOT EXISTS judges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,                     -- 'coursing' | 'exhibition' | 'both'
  region TEXT,
  status TEXT,                       -- 'active' | 'retired'
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX idx_judges_category ON judges(category);
CREATE INDEX idx_judges_region ON judges(region);

-- Event-judge relationships
CREATE TABLE IF NOT EXISTS event_judges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,           -- 'competition' | 'exhibition'
  judge_id INTEGER NOT NULL REFERENCES judges(id),
  role TEXT,                         -- 'main' | 'assistant'
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT
);

CREATE INDEX idx_event_judges_event ON event_judges(event_id);
CREATE INDEX idx_event_judges_judge ON event_judges(judge_id);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  operation TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL,
  reason TEXT
);
```

### 5. exhibitions.sqlite - Exhibitions Data (Local + Turso Sync)

```sql
-- Exhibitions (RKF)
CREATE TABLE IF NOT EXISTS exhibitions_rkf (
  id TEXT NOT NULL,
  year INTEGER NOT NULL,
  data BLOB NOT NULL,                -- compressed exhibition data (gzip)
  PRIMARY KEY (year, id)
);

CREATE INDEX idx_year ON exhibitions_rkf(year);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,           -- TEXT for exhibitions (string ID)
  operation TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  changed_by TEXT NOT NULL,
  reason TEXT
);
```
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  updated_by      TEXT,
  UNIQUE(name_lat, breed)
);

CREATE INDEX idx_dogs_name_lat ON dogs(name_lat);
CREATE INDEX idx_dogs_name_ru ON dogs(name_ru);

-- Judges (normalized)
CREATE TABLE IF NOT EXISTS judges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_judges_name ON judges(name);

-- Event-Judges relationship
CREATE TABLE IF NOT EXISTS event_judges (
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  judge_id INTEGER NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  role TEXT,                          -- 'breed_judge', 'ring_judge', 'main_judge'
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, judge_id)
);

CREATE INDEX idx_event_judges_event ON event_judges(event_id);
CREATE INDEX idx_event_judges_judge ON event_judges(judge_id);

-- Results (unified for competitions + exhibitions)
CREATE TABLE IF NOT EXISTS results (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id        INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  dog_id          INTEGER NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  breed_class     TEXT,
  catalog_no      INTEGER,
  placement       INTEGER,
  total_score     REAL,
  judge_count     INTEGER DEFAULT 3,
  qualification   TEXT,
  vc              TEXT,
  status          TEXT DEFAULT 'finished',
  raw_scores_json TEXT,               -- JSON for detailed scores/times
  raw_text        TEXT,
  status_reason   TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  created_by      TEXT,
  updated_by      TEXT,
  UNIQUE(event_id, dog_id, breed_class)
);

CREATE INDEX idx_results_dog ON results(dog_id);
CREATE INDEX idx_results_event ON results(event_id);
CREATE INDEX idx_results_status ON results(status);
CREATE INDEX idx_results_placement ON results(placement);

-- Donino Speed Records
CREATE TABLE IF NOT EXISTS donino_speed_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER REFERENCES dogs(id) ON DELETE SET NULL,
  breed TEXT NOT NULL,
  sex TEXT NOT NULL,
  name TEXT NOT NULL,
  speed_km_h REAL NOT NULL,
  date TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'normal',
  track_type TEXT,
  history TEXT,                        -- JSON array of historical records
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX idx_donino_speed_dog ON donino_speed_records(dog_id);
CREATE INDEX idx_donino_speed_breed ON donino_speed_records(breed);
CREATE INDEX idx_donino_speed_date ON donino_speed_records(date);

-- Donino Coursing Records
CREATE TABLE IF NOT EXISTS donino_coursing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER REFERENCES dogs(id) ON DELETE SET NULL,
  breed TEXT NOT NULL,
  name TEXT NOT NULL,
  time_seconds REAL NOT NULL,
  date TEXT NOT NULL,
  track_length INTEGER DEFAULT 350,
  history TEXT,                        -- JSON array of historical records
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX idx_donino_coursing_dog ON donino_coursing_records(dog_id);
CREATE INDEX idx_donino_coursing_breed ON donino_coursing_records(breed);
CREATE INDEX idx_donino_coursing_date ON donino_coursing_records(date);
```

### 2. Audit Trail Tables

```sql
-- Unified audit log for all changes
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,             -- 'INSERT' | 'UPDATE' | 'DELETE'
  row_id INTEGER NOT NULL,
  changed_by TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  old_values TEXT,                     -- JSON of previous values
  new_values TEXT,                     -- JSON of new values
  changed_columns TEXT                 -- JSON array of column names
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_row ON audit_log(row_id);
CREATE INDEX idx_audit_log_date ON audit_log(changed_at);

-- Triggers for automatic audit logging
CREATE TRIGGER IF NOT EXISTS trg_events_audit_insert
AFTER INSERT ON events
BEGIN
  INSERT INTO audit_log (table_name, operation, row_id, changed_by, new_values, changed_columns)
  VALUES ('events', 'INSERT', NEW.id, NEW.created_by,
    json_object('id', NEW.id, 'title', NEW.title, 'event_type', NEW.event_type, 'date_start', NEW.date_start),
    json_array('id', 'title', 'event_type', 'date_start'));
END;

CREATE TRIGGER IF NOT EXISTS trg_events_audit_update
AFTER UPDATE ON events
BEGIN
  INSERT INTO audit_log (table_name, operation, row_id, changed_by, old_values, new_values, changed_columns)
  VALUES ('events', 'UPDATE', NEW.id, NEW.updated_by,
    json_object('id', OLD.id, 'title', OLD.title, 'event_type', OLD.event_type, 'date_start', OLD.date_start),
    json_object('id', NEW.id, 'title', NEW.title, 'event_type', NEW.event_type, 'date_start', NEW.date_start),
    json_array('title', 'event_type', 'date_start'));
END;

CREATE TRIGGER IF NOT EXISTS trg_events_audit_delete
AFTER DELETE ON events
BEGIN
  INSERT INTO audit_log (table_name, operation, row_id, changed_by, old_values, changed_columns)
  VALUES ('events', 'DELETE', OLD.id, 'unknown',
    json_object('id', OLD.id, 'title', OLD.title, 'event_type', OLD.event_type, 'date_start', OLD.date_start),
    json_array('id', 'title', 'event_type', 'date_start'));
END;

-- Similar triggers for dogs, results, judges, donino_*
```

### 3. Search & Query Views

```sql
-- Unified search view for all entities
CREATE VIEW IF NOT EXISTS v_search AS
SELECT
  'event' as entity_type,
  e.id as entity_id,
  e.title as name,
  e.event_type as type,
  e.date_start as date,
  e.location as location
FROM events e
UNION ALL
SELECT
  'dog' as entity_type,
  d.id as entity_id,
  d.name_lat as name,
  d.breed as type,
  NULL as date,
  NULL as location
FROM dogs d
UNION ALL
SELECT
  'judge' as entity_type,
  j.id as entity_id,
  j.name as name,
  NULL as type,
  NULL as date,
  NULL as location
FROM judges j;

-- Dog with all results
CREATE VIEW IF NOT EXISTS v_dog_full AS
SELECT
  d.id,
  d.name_lat,
  d.name_ru,
  d.breed,
  d.sex,
  d.owner,
  COUNT(DISTINCT r.event_id) as total_events,
  COUNT(r.id) as total_results,
  SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) as gold_count,
  SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) as silver_count,
  SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) as bronze_count
FROM dogs d
LEFT JOIN results r ON d.id = r.dog_id
GROUP BY d.id;

-- Event with all results
CREATE VIEW IF NOT EXISTS v_event_full AS
SELECT
  e.id,
  e.title,
  e.event_type,
  e.date_start,
  e.location,
  COUNT(r.id) as total_results,
  COUNT(DISTINCT r.dog_id) as total_dogs
FROM events e
LEFT JOIN results r ON e.id = r.event_id
GROUP BY e.id;
```

## Admin API Design

### REST API Endpoints

```typescript
// Event Management
POST   /api/admin/events              // Create new event
GET    /api/admin/events/:id          // Get event by ID
PATCH  /api/admin/events/:id          // Update event
DELETE /api/admin/events/:id          // Delete event
GET    /api/admin/events?search=...   // Search events

// Dog Management
POST   /api/admin/dogs                // Create new dog
GET    /api/admin/dogs/:id            // Get dog by ID
PATCH  /api/admin/dogs/:id            // Update dog
DELETE /api/admin/dogs/:id            // Delete dog
GET    /api/admin/dogs?search=...     // Search dogs

// Result Management
POST   /api/admin/results             // Create new result
GET    /api/admin/results/:id         // Get result by ID
PATCH  /api/admin/results/:id         // Update result
DELETE /api/admin/results/:id         // Delete result
GET    /api/admin/results?event_id=... // Get results for event

// Judge Management
POST   /api/admin/judges              // Create new judge
GET    /api/admin/judges/:id          // Get judge by ID
PATCH  /api/admin/judges/:id          // Update judge
DELETE /api/admin/judges/:id          // Delete judge
GET    /api/admin/judges?search=...   // Search judges

// Donino Records
POST   /api/admin/donino/speed        // Create speed record
POST   /api/admin/donino/coursing    // Create coursing record
PATCH  /api/admin/donino/speed/:id    // Update speed record
PATCH  /api/admin/donino/coursing/:id // Update coursing record

// Audit Log
GET    /api/admin/audit               // Get audit log
GET    /api/admin/audit/:id           // Get specific audit entry
GET    /api/admin/audit?table=events  // Get audit for specific table

// Search
GET    /api/admin/search?q=...        // Unified search
```

### API Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "audit": {
    "id": 123,
    "operation": "UPDATE",
    "changed_at": "2026-08-04T12:00:00Z",
    "changed_by": "admin"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid dog data",
    "details": { ... }
  }
}
```

## Admin Web Interface

### Features

1. **Dashboard**
   - Recent changes (audit log)
   - Statistics (total events, dogs, results)
   - Quick actions (add event, add dog)

2. **Event Editor**
   - Form for creating/editing events
   - Results table with inline editing
   - Judge assignment
   - Track scheme management
   - Raw scores JSON editor

3. **Dog Editor**
   - Form for creating/editing dogs
   - Result history
   - Dog statistics
   - Merge duplicates functionality

4. **Judge Editor**
   - Form for creating/editing judges
   - Event assignments
   - Judge statistics

5. **Donino Records Editor**
   - Speed records table
   - Coursing records table
   - History editing
   - Screenshot upload

6. **Audit Log Viewer**
   - Filterable by table, operation, date
   - Show old/new values
   - Rollback functionality

7. **Search**
   - Unified search across all entities
   - Advanced filters
   - Quick links to edit pages

### Technology Stack

- **Frontend:** React + TypeScript (existing frontend)
- **UI Components:** Tailwind CSS (existing)
- **Data Fetching:** React Query (existing)
- **API:** Cloudflare Workers (existing bot API extended)
- **Auth:** Existing authentication system

## Workflow for Adding/Editing Data

### 1. Add New Competition

```
User → Admin Interface → "Add Event" Form
  ↓
Fill event details (date, location, type, judges)
  ↓
Create event via API → POST /api/admin/events
  ↓
Upload results (CSV/JSON) or manual entry
  ↓
Results created via API → POST /api/admin/results
  ↓
Dogs auto-created or matched via name_lat + breed
  ↓
Audit log updated automatically
  ↓
Local SQLite synced to Turso via GitHub Actions (exhibitions only)
```

### 2. Add New Exhibition

```
User → Admin Interface → "Add Exhibition" Form
  ↓
Fill exhibition details (date, location, judges)
  ↓
Create exhibition via API → POST /api/admin/events (source_type='exhibition')
  ↓
Upload ring entries (CSV/JSON) or manual entry
  ↓
Ring entries created via API → POST /api/admin/results
  ↓
Dogs auto-created or matched via name_lat + breed
  ↓
Audit log updated automatically
  ↓
Local SQLite synced to Turso via GitHub Actions (exhibitions only)
```

### 3. Edit Specific Result

```
User → Search Interface → "Find result"
  ↓
Search by dog name, event, date, placement
  ↓
Click result → Result Editor
  ↓
Edit placement, score, status
  ↓
Save via API → PATCH /api/admin/results/:id
  ↓
Audit log updated automatically
  ↓
Frontend auto-refreshes via React Query
```

### 4. Add New Dog

```
User → Admin Interface → "Add Dog" Form
  ↓
Fill dog details (name_lat, name_ru, breed, sex)
  ↓
Create dog via API → POST /api/admin/dogs
  ↓
Optionally link to existing results
  ↓
Audit log updated automatically
```

## Search & Query Capabilities

### 1. Unified Search

```sql
-- Search by name
SELECT * FROM v_search WHERE name LIKE '%Query%';

-- Search by type
SELECT * FROM v_search WHERE type = 'coursing';

-- Search by date range
SELECT * FROM v_search WHERE date BETWEEN '2026-01-01' AND '2026-12-31';
```

### 2. Specific Entity Search

```sql
-- Find dog by name
SELECT * FROM dogs WHERE name_lat LIKE '%QUERY%' OR name_ru LIKE '%QUERY%';

-- Find event by title
SELECT * FROM events WHERE title LIKE '%QUERY%';

-- Find judge by name
SELECT * FROM judges WHERE name LIKE '%QUERY%';

-- Find result by placement
SELECT r.*, d.name_lat, e.title
FROM results r
JOIN dogs d ON r.dog_id = d.id
JOIN events e ON r.event_id = e.id
WHERE r.placement = 1;
```

### 3. Complex Queries

```sql
-- Get dog's full history
SELECT
  e.id as event_id,
  e.title,
  e.date_start,
  e.event_type,
  r.placement,
  r.total_score,
  r.qualification
FROM results r
JOIN events e ON r.event_id = e.id
WHERE r.dog_id = :dog_id
ORDER BY e.date_start DESC;

-- Get event's full results
SELECT
  d.id as dog_id,
  d.name_lat,
  d.breed,
  r.placement,
  r.total_score,
  r.qualification
FROM results r
JOIN dogs d ON r.dog_id = d.id
WHERE r.event_id = :event_id
ORDER BY r.placement;
```

## Implementation Plan (Revised, 9 Phases, ~9 Weeks)

### Phase 0: Critical Fixes (Must Complete First, 1 week)
**Goal:** Fix broken Turso sync and restore exhibitions.sqlite.

**Tasks:**
1. **Debug Turso sync workflow error**
   - Investigate "@libsql/linux-x64-gnu" MODULE_NOT_FOUND error
   - Check package.json dependencies
   - Verify GitHub Actions runtime environment
   - Try alternative Turso client or fix dependency

2. **Fix workflow trigger paths**
   - Update .github/workflows/sync-turso.yml
   - Change trigger from data/local/** to manual workflow_dispatch
   - Add optional turso_sync inputs for manual control

3. **Restore exhibitions.sqlite**
   - Option A: Export from Turso to local SQLite (backend/scripts/turso/export-turso-to-local.ts)
   - Option B: Re-parse RKF PDFs (backend/scripts/migrate-exhibitions-rkf-to-sqlite.ts)
   - Verify file integrity (189 MB, 51,429 rows)

4. **Verify data consistency**
   - Compare Turso vs local SQLite row counts
   - Sample verification of critical exhibitions
   - Document any discrepancies

**Deliverables:**
- Fixed sync-turso.yml workflow
- Restored exhibitions.sqlite
- Data consistency report

### Phase 1: Create Modular SQL Files (1.5 weeks)
**Goal:** Create modular SQL files with schemas for each data domain.

**Tasks:**
1. **Create dogs.sqlite**
   - Schema: dogs table + audit_log
   - Initialize empty database
   - Create triggers for audit logging

2. **Create competitions.sqlite**
   - Schema: events table + results table + audit_log
   - Initialize empty database
   - Create triggers for audit logging

3. **Create donino.sqlite**
   - Schema: speed_records table + coursing_records table + audit_log
   - Initialize empty database
   - Create triggers for audit logging

4. **Create judges.sqlite**
   - Schema: judges table + event_judges table + audit_log
   - Initialize empty database
   - Create triggers for audit logging

5. **Update exhibitions.sqlite**
   - Add audit_log table to existing exhibitions.sqlite
   - Create triggers for audit logging

**Deliverables:**
- 5 modular SQL files initialized (dogs.sqlite, competitions.sqlite, donino.sqlite, judges.sqlite, exhibitions.sqlite)
- All audit_log tables and triggers created
- Schemas documented

### Phase 2: Migrate Competitions to competitions.sqlite (1 week)
**Goal:** Migrate existing competitions JSON data to competitions.sqlite.

**Tasks:**
1. Create migration script: backend/scripts/migrate/migrate-competitions-to-sqlite.ts
2. Read all data/v1/competitions/**/*.json files
3. Map flat JSON structure to normalized schema (events/dogs/results)
4. Import dogs to dogs.sqlite (foreign key reference)
5. Import events to competitions.sqlite
6. Import results to competitions.sqlite
7. Preserve all existing data (no data loss)
8. Validate migrated data (row counts, critical samples)
9. Keep JSON files as backup until validation passes

**Deliverables:**
- Migration script
- Competitions data in competitions.sqlite
- Dogs data in dogs.sqlite
- Validation report
- JSON backup (deleted after validation)

### Phase 3: Migrate Donino to donino.sqlite (0.5 weeks)
**Goal:** Migrate donino speed/coursing records to donino.sqlite.

**Tasks:**
1. Create migration script: backend/scripts/migrate/migrate-donino-to-sqlite.ts
2. Read data/v1/donino/speed_records.json and coursing_records.json
3. Map to speed_records and coursing_records tables
4. Import dogs to dogs.sqlite (foreign key reference)
5. Validate migrated data (224 records)
6. Keep JSON files as backup

**Deliverables:**
- Migration script
- Donino data in donino.sqlite
- Validation report

### Phase 4: Migrate Judges to judges.sqlite (0.5 weeks)
**Goal:** Migrate judges data to judges.sqlite.

**Tasks:**
1. Create migration script: backend/scripts/migrate/migrate-judges-to-sqlite.ts
2. Read data/v1/indexes/judges-summary.json
3. Map to judges table
4. Normalize judge names and categories
5. Validate migrated data
6. Keep JSON files as backup

**Deliverables:**
- Migration script
- Judges data in judges.sqlite
- Validation report

### Phase 5: Update Admin API to Write SQL Files (1.5 weeks)
**Goal:** Replace admin API JSON writes with SQL file writes.

**Tasks:**
1. **Update load-events.ts**
   - Change from SQL file generation to SQLite INSERT (competitions.sqlite)
   - Use better-sqlite3 for direct writes
   - Verify invariants (total_score = grand_total)

2. **Update load-results.ts**
   - Change from POST to admin API to direct SQLite INSERT (competitions.sqlite)
   - Maintain error handling
   - Verify data integrity

3. **Replace admin PUT handlers**
   - routes/admin/events.ts: fs.writeFile → SQLite UPDATE (competitions.sqlite)
   - routes/admin/results.ts: fs.writeFile → SQLite UPDATE (competitions.sqlite)
   - routes/admin/dogs.ts: СОЗДАТЬ SQLite write path (dogs.sqlite)

4. **Integrate audit logging**
   - All write operations trigger audit_log INSERT
   - Capture user identity (created_by/updated_by)
   - Add optional reason field for manual edits

5. **Verify invariants**
   - total_score = grand_total (found in 23 locations across parsers)
   - Check all parsers (coursing, bzmp, racing, unique)
   - Ensure migration preserves this rule

**Deliverables:**
- Updated load-events.ts (SQLite write)
- Updated load-results.ts (SQLite write)
- Updated admin routes (SQLite write)
- Audit logging integrated
- Invariant verification report

### Phase 6: Cloudflare D1 Integration (1 week)
**Goal:** Configure Cloudflare D1 to serve SQL files for competitions/donino/judges/dogs.

**Tasks:**
1. **Create Cloudflare D1 databases**
   - dogs D1 database
   - competitions D1 database
   - donino D1 database
   - judges D1 database

2. **Create sync workflow**
   - GitHub Actions to sync SQL files to D1
   - Trigger on push to main branch
   - Verify sync integrity

3. **Update frontend to read from D1**
   - Update data fetching to use @libsql/client for D1
   - Keep JSON fallback for compatibility
   - Update React Query hooks

4. **Verify data integrity**
   - Compare D1 vs local SQL files
   - Sample verification of critical data
   - Performance testing

**Deliverables:**
- Cloudflare D1 databases created
- Sync workflow working
- Frontend reading from D1
- Data integrity report

### Phase 7: Exhibition Protocols Investigation (1 week)
**Goal:** Investigate and restore exhibition protocols (currently opening PDF instead of HTML).

**Tasks:**
1. **Investigate current behavior**
   - Check current ShowCalendar.tsx implementation
   - Verify rkf.online URLs for exhibitions
   - Compare with competitions event pages (localhost:5173/event/1303)

2. **Find historical implementation**
   - Search git history for exhibition protocol pages
   - Check if exhibition detail pages existed before
   - Identify what changed

3. **Restore exhibition protocols**
   - Implement exhibition detail pages (similar to competitions)
   - Parse exhibition data from exhibitions.sqlite
   - Display full exhibition results (dogs, placements, qualifications)

4. **Update routing**
   - Add route for exhibition detail pages
   - Update ShowCalendar.tsx to link to detail pages instead of rkf.online

**Deliverables:**
- Exhibition protocol pages implemented
- ShowCalendar.tsx updated
- Exhibition detail routing working
- Documentation updated

### Phase 8: Update Build Pipeline (0.5 weeks)
**Goal:** Update build-all-data to read from SQL files instead of JSON.

**Tasks:**
1. **Update build-all-data**
   - Read from SQL files instead of JSON files
   - Maintain same index structure
   - Handle SQL files missing (fallback to JSON)

2. **Verify index builds**
   - Compare output with current indexes
   - Ensure no regressions
   - Performance comparison

**Deliverables:**
- Updated build-all-data pipeline
- Index build verification

### Phase 9: Testing & Cleanup (1 week)
**Goal:** Full testing and documentation update.

**Tasks:**
1. **Unit tests**
   - Test all migrations (competitions, donino, judges)
   - Test write paths (admin API, migration scripts)

2. **Integration tests**
   - Test full pipeline: parser → SQL files → D1 → frontend
   - Test exhibitions: SQLite → Turso → frontend

3. **Manual testing**
   - Test admin interface (edit event, dog, result)
   - Verify audit log entries
   - Test search functionality
   - Test exhibition detail pages

4. **Cleanup**
   - Remove obsolete SQL file generation (load-events.ts)
   - Remove obsolete admin API JSON write paths
   - Update documentation (00-AI-GUIDE, ADR-009)
   - Archive JSON backups (keep for 1 month)

5. **Update ADR-011**
   - Mark as Accepted
   - Document final architecture
   - Add lessons learned

**Deliverables:**
- Test suite passing
- End-to-end pipeline verified
- Documentation updated
- ADR-011 accepted
   - Mark as Accepted
   - Document final architecture
   - Add lessons learned

**Deliverables:**
- Test suite passing
- End-to-end pipeline verified
- Documentation updated
- ADR-011 accepted

## Skills by Phase

### Phase 0: Critical Fixes (Turso sync, восстановление sqlite)
**Skills by importance:**
1. **debugging-and-error-recovery** — систематический триаж ошибки `@libsql/linux-x64-gnu`
2. **ci-cd-and-automation** — починка триггеров workflow
3. **verify-security** — проверить токены/креды Turso не потекли при правках
4. **git-workflow-and-versioning** — если меняете `.gitignore` под sqlite файлы

### Phase 1: Create Modular SQL Files
**Skills by importance:**
1. **spec-driven-development** — сначала спека схемы, потом код
2. **api-and-interface-design** — схема БД это по сути контракт для всех потребителей
3. **verify-patterns** — сверка с инвариантами (`total_score = grand_total`, `cs-v1`)
4. **documentation-and-adrs** — фиксировать финальную схему в ADR по ходу

### Phase 2: Migrate Competitions to competitions.sqlite
**Skills by importance:**
1. **test-driven-development** — валидация row counts / сэмплов
2. **verification** — сверка мигрированных данных с исходником
3. **incremental-implementation**

### Phase 3: Migrate Donino to donino.sqlite
**Skills by importance:**
1. **test-driven-development**
2. **verification**
3. **incremental-implementation** — самый маленький датасет, хороший тест паттерна миграции

### Phase 4: Migrate Judges to judges.sqlite
**Skills by importance:**
1. **test-driven-development**
2. **verification**
3. **incremental-implementation**

### Phase 5: Update Admin API to Write SQL Files
**Skills by importance:**
1. **incremental-implementation** — переключать write-пути по одному, не все разом
2. **test-driven-development** — тест на каждый путь до переключения
3. **deprecation-and-migration** — корректное выведение из строя JSON-записи в admin API
4. **debugging-and-error-recovery** — на случай регрессий при переключении

### Phase 6: Cloudflare D1 Integration
**Skills by importance:**
1. **ci-cd-and-automation** — создание sync workflow для D1
2. **performance-optimization** — тестирование производительности D1
3. **observability-and-instrumentation** — логирование sync процесса
4. **verify-security** — проверка D1 credentials

### Phase 7: Exhibition Protocols Investigation
**Skills by importance:**
1. **debugging-and-error-recovery** — расследование куда пропали протоколы
2. **git-workflow-and-versioning** — поиск исторической реализации
3. **frontend-ui-engineering** — реализация exhibition detail pages
4. **improve-codebase-architecture** — интеграция с exhibitions.sqlite

### Phase 8: Update Build Pipeline
**Skills by importance:**
1. **improve-codebase-architecture** — убрать JSON→memory костыль
2. **performance-optimization** — убедиться, что сборка не стала медленнее
3. **code-review-and-quality**
4. **observability-and-instrumentation** — логирование, чтобы CI явно падал, если sqlite файлов нет

### Phase 9: Testing & Cleanup
**Skills by importance:**
1. **test-driven-development**
2. **verify-quality** + **code-review-and-quality**
3. **verify-security** — аудит-лог, права доступа к admin API
4. **documentation-and-adrs** — финальное обновление ADR, статус → Accepted
5. **shipping-and-launch** — чеклист перед деплоем в прод

### Cross-Phase Skills (на всех фазах)
- **planning-and-task-breakdown** — держать фазы в заявленных рамках, не расползаться
- **context-engineering** — учитывая объём доков проекта, не тащить в контекст лишнее на каждой фазе
- **Явно НЕ использовать ponytail** (ленивые решения) для этого проекта — миграция данных с audit trail это тот случай, где "самый простой путь" обычно означает потерю данных

## Out of Scope (Future Work)

### Dog ID Linkage Project
**Separate initiative** - linking sport dogs (numeric dog_id) with exhibition dogs (dog_name string).

**Why separate:**
- 51,429 exhibition records + ~450K competition dogs
- Requires fuzzy matching + manual verification
- Examples from roadmap: 5634/9741, 5641/9743
- High effort, high risk, not blocking this migration

**Approach:**
- Fuzzy match by name + breed
- Manual verification of edge cases
- Separate ADR document
- Separate implementation timeline

### Exhibitions Data Normalization
**Current state:** exhibitions-rkf data is stored as compressed BLOB (gzip) in exhibitions_rkf table (51,429 rows = 51,430 exhibitions).

**Future work:**
- Parse and normalize exhibition ring data (currently compressed BLOB)
- Create exhibition results table (similar to competitions results)
- Link exhibition results to unified dogs table

**Why not now:**
- Exhibition result structure differs from competitions (placements vs scores)
- Requires separate data normalization effort
- Can be done incrementally after Phase 7

### Admin Interface Enhancement
**Current admin API is sufficient** for basic operations (PUT /api/admin/events/:id).

**Future enhancements:**
- React admin UI (currently command-line/JSON editing)
- Advanced search filters
- Bulk operations
- Audit log viewer UI

**Why not now:**
- Admin API already functional
- User may delegate to agent (CLI editing)
- Functionality over aesthetics per user preference

## Timeline Summary

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0: Critical Fixes | 1 week | None (must do first) |
| Phase 1: Create Modular SQL Files | 1.5 weeks | Phase 0 |
| Phase 2: Migrate Competitions | 1 week | Phase 1 |
| Phase 3: Migrate Donino | 0.5 weeks | Phase 1 |
| Phase 4: Migrate Judges | 0.5 weeks | Phase 1 |
| Phase 5: Update Admin API | 1.5 weeks | Phase 2, Phase 3, Phase 4 |
| Phase 6: Cloudflare D1 Integration | 1 week | Phase 5 |
| Phase 7: Exhibition Protocols | 1 week | Phase 6 |
| Phase 8: Update Build Pipeline | 0.5 weeks | Phase 6 |
| Phase 9: Testing & Cleanup | 1 week | Phase 6, Phase 7, Phase 8 |
| **Total** | **~9 weeks** | |

## Key Risks & Mitigations

### Risk 1: Turso sync workflow fails to fix
**Mitigation:** Manual sync workflow_dispatch trigger as fallback

### Risk 2: Parser refactoring breaks existing invariants
**Mitigation:** Comprehensive invariant testing (total_score = grand_total)

### Risk 3: Build-all-data regression (index generation breaks)
**Mitigation:** Compare output with current indexes before deploying

### Risk 4: Data loss during migration
**Mitigation:** Keep JSON backups until validation passes, use transactions

### Risk 5: Dog ID linkage complexity exceeds estimates
**Mitigation:** Out of scope - separate project

## Consequences

### Pros
- ✅ All data in SQL format (as requested)
- ✅ Modular SQL files by topic (dogs, competitions, donino, judges, exhibitions)
- ✅ Unified dog registry (links sport + exhibitions)
- ✅ Automatic audit trail for all changes (triggers)
- ✅ Cloudflare D1 for competitions/donino/judges/dogs (small files)
- ✅ Exhibitions in Turso only (size constraint respected)
- ✅ No binary git history (SQL files in git but not committed, only sync to D1)
- ✅ Reduced complexity (no JSON export for CDN, direct D1 serving)
- ✅ Exhibition protocols investigation (Phase 7 addresses open question)

### Cons
- ⚠️ Significant development effort (~9 weeks)
- ⚠️ Turso sync still broken (Phase 0 critical fix)
- ⚠️ Dog ID linkage not solved (separate project)
- ⚠️ Admin interface still CLI-based (not enhanced UI)
- ⚠️ Cloudflare D1 adds complexity (new infrastructure)

## Alternatives Considered

### Alternative 1: Single Unified SQLite File
**Rejected because:**
- User requested modular SQL files by topic
- Separate files easier to manage and sync

### Alternative 2: SQL Files in Git
**Rejected because:**
- No git diff capability for binary files
- Violates git best practices for large binary files
- Growing binary history will bloat repository

### Alternative 3: JSON Only (No SQLite)
**Rejected because:**
- Fragmented write paths, no audit trail
- No single source of truth
- User requested all data in SQL format

### Alternative 4: Turso Primary for All Data
**Rejected because:**
- Exhibitions size constraint (189 MB > 25 MB CDN limit)
- Turso sync workflow is broken
- No local SQLite file (exhibitions-rkf-archive.sqlite missing)

### Alternative 2: JSON-Only Architecture (No SQLite)
**Rejected because:**
- No audit trail without SQLite triggers
- Difficult to enforce constraints (FK, UNIQUE)
- build-all-data would still need in-memory SQLite
- No single source of truth (fragmented write paths)

### Alternative 3: Binary SQLite in Git
**Rejected because:**
- No git diff capability
- Claude's "precedent" was incorrect (file not in git)
- Violates git best practices for large binary files

## References

### Real Data Analysis
- Parser output: in-memory objects (not SQL) - verified in backend/parsers/
- load-events.ts: generates SQL file (unused) - verified in backend/scripts/load/
- load-results.ts: POST to admin API - verified in backend/scripts/load/
- admin API: writes JSON files - verified in backend/src/routes/admin/
- build-all-data: reads JSON → memory SQLite - verified in backend/scripts/build-derived/shared.ts
- Turso sync: broken workflow, "@libsql/linux-x64-gnu" error - verified in GitHub Actions logs
- exhibitions-rkf-archive.sqlite: does not exist locally - verified in file system

### Invariant Verification
- total_score = grand_total: found in 23 locations across parsers
- rating_score (cs-v1): depends on avg_judge_score, best_judge_score, total_starts, judge_eval_count
- All fields exist in current schema.sql

### Dog ID Linkage
- Sport dogs: numeric dog_id (data/v1/dogs/by-id/20.json)
- Exhibition dogs: dog_name string (data/v1/shows/exhibitions/10000-type1.json)
- Separate ID spaces - requires manual verification project
- ⚠️ Need for authentication/authorization
- ⚠️ Storage of audit log (~10-20 MB)
- ⚠️ Testing precautions required (to avoid Turso quota usage)

### Storage Estimate
- Current data: ~205 MB
- Audit log: ~10-20 MB (estimated)
- Total: ~215-225 MB (4.5% of 5 GB limit)

## Alternatives

### Option A: Minimal Admin System
- Only basic CRUD API
- No audit trail
- Simple admin forms
- **Time:** 4 weeks
- **Trade-off:** Less accountability, harder to debug

### Option B: Third-Party Admin Interface
- Use Datasette or tursotui
- No custom admin interface
- Manual data editing
- **Time:** 2 weeks
- **Trade-off:** Less user-friendly, no custom workflow

### Option C: Full Admin System (Recommended)
- Custom admin interface
- Full audit trail
- Comprehensive search
- **Time:** 9 weeks
- **Trade-off:** More development, better UX

## Rollback Plan

1. Keep JSON files as backup during migration
2. Create database backups before schema changes
3. Implement feature flags for admin system
4. Monitor for issues post-deployment
5. Rollback to JSON if critical issues arise

## References
- Turso documentation: https://turso.tech/docs
- sqlite-history library: https://github.com/simonw/sqlite-history
- tursotui: https://github.com/mikeleppane/tursotui
- Current schema.sql: backend/schema.sql
- ADR-009: Turso migration for exhibitions-rkf
