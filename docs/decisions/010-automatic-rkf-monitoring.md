# ADR-010: Automatic RKF Calendar Monitoring

**Status:** Proposed  
**Date:** 2026-08-04  
**Decision:** Implement automatic monitoring of RKF calendar for new exhibitions and reports

## Context

Current workflow:
- Manual calendar scraping from rkf.online
- Manual PDF download and parsing
- Manual data upload to SQLite/Turso
- No automatic detection of new exhibitions or reports

Problems:
- Time-consuming manual process
- Risk of missing new exhibitions
- Delayed availability of new results
- No automated data freshness

## Decision

Implement automatic RKF calendar monitoring with:

### Monitoring System

```
GitHub Actions (every 6 hours)
        ↓
scan RKF calendar for 2026
        ↓
Compare with current data
        ↓
New exhibitions → add to calendar
New reports → download + parse → Turso
        ↓
Auto-sync to Turso
```

### Components

1. **monitor-rkf-calendar.ts**
   - Scans RKF calendar for specified year
   - Detects new exhibitions (not in current data)
   - Detects new reports (has_report_link changed)
   - Returns list of changes

2. **auto-process-reports.ts**
   - Downloads PDF reports
   - Parses using existing PDF parser
   - Uploads to Turso automatically
   - Error handling and retry logic

3. **GitHub Actions: monitor-rkf-calendar.yml**
   - Runs every 6 hours via cron
   - Manual trigger via workflow_dispatch
   - Integrated with Turso sync workflow

### Data Flow

**Before (Manual):**
```
User → Manual check rkf.online → Manual download → Manual parse → Manual upload
```

**After (Automatic):**
```
GitHub Actions → Auto-scan → Auto-download → Auto-parse → Auto-upload
```

## Alternatives Considered

### Manual Process
- Pros: Full control, no automation complexity
- Cons: Time-consuming, error-prone, not scalable
- Rejected: Manual process doesn't scale with data volume

### Daily Manual Script
- Pros: Less manual work
- Cons: Still requires manual execution
- Rejected: Eliminates automation benefits

### Cloudflare Workers Real-time
- Pros: Instant updates
- Cons: Complex, resource-intensive, unnecessary frequency
- Rejected: 6-hour frequency is sufficient for exhibitions

## Consequences

### Benefits
- Automatic detection of new exhibitions
- Automatic processing of new reports
- Reduced manual work
- Improved data freshness
- Scalable monitoring solution

### Trade-offs
- GitHub Actions execution time (free tier limits)
- Need for PDF parser integration
- Error handling complexity
- Turso write quota monitoring

### Monitoring
- GitHub Actions execution logs
- Turso write quota usage
- Processing success/failure rates
- Data freshness metrics

## Implementation Steps

1. ✅ Create monitor-rkf-calendar.ts
2. ✅ Create auto-process-reports.ts
3. ✅ Create GitHub Actions workflow
4. ⏳ Integrate with existing PDF parser
5. ⏳ Implement single-record Turso updates
6. ⏳ Add error handling and retry logic
7. ⏳ Test with real RKF data
8. ⏳ Deploy to production

## Rollback Plan

If automatic monitoring fails:
- Disable GitHub Actions workflow
- Revert to manual process
- Keep manual scripts as backup

## References

- Turso migration: ADR-009
- PDF processing: ADR-006
- Exhibitions data: docs/sheets/04-shows.md
