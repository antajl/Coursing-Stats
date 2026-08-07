# ADR-003: SQLite + JSON Indexes

**Status:** Accepted  
**Date:** 2025-03-01  
**Context:** Data storage and performance optimization

## Context

Coursing Stats needed a data storage solution that provides:
- Fast read performance for rankings and statistics
- Easy data export for frontend consumption
- Historical data preservation
- Simple deployment and backup
- Low computational requirements

## Decision

**Chose SQLite database + JSON indexes** hybrid approach.

### Architecture
1. **SQLite (pc-db.sqlite):** Source of truth for all data
2. **JSON indexes:** Pre-computed files for common queries
3. **Generation:** Python scripts build JSON from SQLite
4. **Frontend:** Reads JSON indexes via static files

### Rationale

**SQLite Advantages:**
- Single file database (easy backup)
- ACID compliance for data integrity
- Excellent read performance
- No separate database server needed
- Cross-platform compatibility

**JSON Indexes Advantages:**
- Static files can be cached by CDN
- Fast frontend loading (no database queries)
- Easy API (just fetch JSON)
- Reduces server load
- Simple versioning

**Rejected Alternatives:**
- **PostgreSQL:** Overkill, requires separate server
- **MongoDB:** No SQL relations, higher learning curve
- **Pure JSON:** No ACID guarantees, data integrity risks
- **MySQL:** Requires separate server, more complex setup

## Consequences

### Positive
- Excellent read performance
- Easy deployment (static files)
- Data integrity guaranteed by SQLite
- CDN caching for JSON files
- Simple backup (single SQLite file)
- Low computational requirements

### Negative
- Two storage systems to maintain
- Build step required for JSON generation
- Stale data if JSON not rebuilt after SQLite changes
- Higher storage usage (duplicate data)

### Implementation
- Python scripts process raw data into SQLite
- `npm run build-all-data` generates JSON indexes
- JSON files stored in `data/v1/`
- Frontend fetches from `data/v1/` directory
- CI/CD pipeline ensures data consistency

## References

- Data workflow: .devin/skills/data-workflow/SKILL.md
- Data docs: docs/sheets/02-data-pipeline.md
