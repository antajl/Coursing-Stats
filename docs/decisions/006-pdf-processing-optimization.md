# ADR-006: PDF Processing Optimization

## Status
Accepted

## Context
The project previously stored 74,454 PDF files (22 GB) locally in `data/local/rkf-reports/` containing RKF exhibition results from 2019-2026. This created several issues:

1. **Storage overhead**: 22 GB of local storage for raw PDF files
2. **Wiki skill conflicts**: Large directory caused issues with the wiki skill
3. **Redundant data**: Historical data (2019-2025) was already processed and available in JSON format
4. **Maintenance burden**: Manual processing of new PDF files was required

Initial attempts to move PDF processing to Cloudflare Workers failed due to technical limitations:
- PDF.js libraries incompatible with Workers environment (CDN worker loading issues)
- PDF-parse library requires Node.js filesystem dependencies not available in Workers
- Workers AI `toMarkdown()` returned empty text for RKF PDF files
- Memory and filesystem limitations in Workers environment

## Decision
1. **Delete historical PDF files**: Remove PDF files for 2019-2025 years (already processed data)
2. **Automate 2026 processing**: Use existing local parser with automation script
3. **Immediate deletion**: Delete PDF files immediately after successful JSON extraction
4. **RKF integration**: Add `--auto-process` flag to download script for seamless workflow
5. **Focus on new data**: Only process new PDF files as they appear in 2026

## Implementation

### Files Created/Modified
- `backend/scripts/auto-process-pdf.ts` - New automation script for PDF processing
- `backend/scripts/shows/download-rkf-reports.ts` - Added `--auto-process` flag
- `data/local/rkf-reports/` - Deleted 2019-2025 directories, kept only 2026

### Processing Flow
1. Download new RKF PDF files using download script
2. Automatically process PDF files using existing parser
3. Extract data to JSON format
4. Delete original PDF files immediately after successful processing
5. Store only JSON results in `data/v1/shows/exhibitions/`

### Usage
```bash
# Download and auto-process new PDF files
npx tsx backend/scripts/shows/download-rkf-reports.ts --year=2026 --auto-process

# Process existing PDF files manually
npm run auto-process-pdf
```

## Consequences

### Positive
- **Storage savings**: Freed ~22 GB of disk space (historical PDFs) + ~2.5 GB (2026 PDFs)
- **Automated workflow**: Seamless download-to-processing pipeline
- **No data loss**: All historical data preserved in JSON format
- **Reduced maintenance**: Automatic processing eliminates manual steps
- **Wiki compatibility**: Removed large directory conflicts

### Negative
- **Immediate deletion**: PDF files deleted immediately after processing (no backup)
- **No reprocessing**: Cannot reprocess original PDFs if parser bugs are found
- **Local-only**: Processing requires local machine (not serverless)

### Alternatives Considered
1. **Cloudflare Workers processing** - Rejected due to technical limitations
2. **Backup PDF storage** - Rejected to maximize storage savings
3. **Cloud PDF storage (R2)** - Rejected due to credit card requirement for free tier
4. **Hybrid approach** - Current solution balances automation and simplicity

## Future Considerations
- Consider PDF backup strategy if reprocessing becomes necessary
- Explore serverless PDF processing if Workers limitations improve
- Monitor 2026 data quality to ensure parser accuracy
- Consider batch processing for large updates

## Metrics
- **Files processed**: 5,045 PDF files (2026 only)
- **Storage freed**: ~24.5 GB total
- **Processing success rate**: 100% (5,045/5,045 files)
- **Processing time**: ~5-10 minutes for 5,045 files

## Post-Implementation Analysis (2026-08-03)

### Data Structure Findings
Following PDF optimization, a comprehensive data structure analysis revealed:
- **Git repository size**: 951 MB (not 6 GB as initially thought)
- **Working directory**: 6.7 GB (exhibitions-rkf/ + year-data/)
- **exhibitions-rkf/**: 51,430 parsed RKF protocol files (1.38 GB)
- **Key insight**: The large working directory size is due to derived data, not source data

### Lessons Learned
1. **Accurate sizing matters**: Initial 6 GB estimate was incorrect; git repo is only 951 MB
2. **Derived data classification**: exhibitions-rkf/ contains parsed protocols (derived), not raw source data
3. **Git tracking optimization**: Some derived files (dog-ranking*.json, exhibitions-merged/) still tracked in git despite .gitignore
4. **Storage hierarchy**: 
   - Source data: Already optimal (minimal raw data in git)
   - Derived data: Should be excluded from git (year-data/, derived indexes)
   - Working copy: Naturally larger due to local development files

### Recommendations
1. **Remove derived data from git tracking**: `git rm --cached` for dog-ranking*.json and exhibitions-merged/
2. **Clarify .gitignore**: Ensure all derived data patterns are properly excluded
3. **Monitor exhibitions-rkf/**: Consider compression or alternative storage if size grows significantly
4. **Regular cleanup**: Implement periodic cleanup of temporary derived files

## References
- [ADR-003: SQLite + JSON indexes](./003-sqlite-json-indexes.md)
- [docs/sheets/04-shows.md)
- [backend/scripts/auto-process-pdf.ts](../../backend/scripts/auto-process-pdf.ts)
