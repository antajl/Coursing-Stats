# Speed Records Troubleshooting Guide

This guide covers common issues and solutions for the Speed Records feature.

## Quick Reference

### Database Commands
```bash
# Check total records in database
npx wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) as total FROM speed_records"

# Check specific dog records
npx wrangler d1 execute pc-db --remote --command="SELECT * FROM speed_records WHERE name='Тайга' AND breed='Салюки'"

# Clean database (use with caution!)
npx wrangler d1 execute pc-db --remote --command="DELETE FROM speed_records"

# Reload data after cleaning
npx tsx backend/scripts/speed/fetch-speed-records.ts --remote
```

### Backend Commands
```bash
# Deploy backend after changes
cd backend
npx wrangler deploy

# Test script locally
npx tsx backend/scripts/speed/fetch-speed-records.ts

# Test script with remote database
npx tsx backend/scripts/speed/fetch-speed-records.ts --remote
```

### Frontend Commands
```bash
# Check API response
curl "https://procoursing-stats.antajltube.workers.dev/api/speed-records"

# Check API response with limit
curl "https://procoursing-stats.antajltube.workers.dev/api/speed-records?limit=1000"
```

## Common Issues

### Issue 1: Database has too many records (2000+ instead of ~187)

**Symptoms:**
- Database shows 2000+ records when it should have ~187
- API returns duplicate records
- Frontend shows duplicate dogs

**Root Cause:**
Multiple `INSERT OR REPLACE` operations without cleaning old data. Each time the script runs, it adds new records without removing old ones.

**Solution:**
```bash
# Step 1: Clean the database
npx wrangler d1 execute pc-db --remote --command="DELETE FROM speed_records"

# Step 2: Reload data
npx tsx backend/scripts/speed/fetch-speed-records.ts --remote

# Step 3: Verify
npx wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) as total FROM speed_records"
# Should show 187
```

**Prevention:**
- Always clean database before major data reloads
- Consider adding `DELETE FROM speed_records` to the script before `INSERT OR REPLACE`
- Monitor database size regularly

### Issue 2: Frontend shows only one record per dog, history not visible

**Symptoms:**
- Dog shows only best result
- History popup doesn't appear on hover
- Only 16-20 dogs visible instead of 131

**Root Cause:**
Frontend grouping key doesn't match backend history grouping key. If backend groups by `name + breed` but frontend groups by `name + breed + sex`, records with different sex values won't be grouped together.

**Solution:**
Ensure both backend and frontend use the same grouping key:

**Backend** (`backend/scripts/speed/fetch-speed-records.ts` line 240):
```typescript
const key = `${record.name}_${record.breed}`;
```

**Frontend** (`frontend/src/pages/SpeedRecords/index.tsx` line 105):
```typescript
const key = `${record.name}_${record.breed}`;
```

### Issue 3: Infinite React render loop

**Symptoms:**
- "Maximum update depth exceeded" error in console
- Page freezes or becomes unresponsive
- High CPU usage

**Root Cause:**
`setState` inside `useCallback` or `useEffect` with wrong dependencies creates an infinite loop.

**Solution:**
Restructure the code to avoid setState in useCallback:

**Before (problematic):**
```typescript
const applyFilters = useCallback((baseRecords) => {
  // ... filtering logic
  setRecords(sorted); // setState in useCallback causes loop
}, [filterYears, filterBreeds, filterSexes, searchQuery, sortField, sortDirection]);

useEffect(() => {
  applyFilters(allRecords);
}, [allRecords, applyFilters]); // applyFilters changes on every render
```

**After (correct):**
```typescript
const applyFilters = useCallback((baseRecords) => {
  // ... filtering logic
  return sorted; // Return data instead of setState
}, [filterYears, filterBreeds, filterSexes, searchQuery, sortField, sortDirection]);

const filteredRecords = useMemo(() => {
  return applyFilters(allRecords);
}, [allRecords, applyFilters]);

useEffect(() => {
  setRecords(filteredRecords);
}, [filteredRecords]); // filteredRecords is stable
```

### Issue 4: API returns only 100 records

**Symptoms:**
- Frontend shows limited number of dogs (16-20)
- Debug info shows `speedRecordsData: 100`
- Should show 131 dogs

**Root Cause:**
Default LIMIT in API endpoint is 100.

**Solution:**
Increase LIMIT in both backend and frontend:

**Backend** (`backend/src/routes/speed.ts` line 16):
```typescript
const limit = parseInt(limitParam) || 1000; // Change from 100 to 1000
```

**Frontend** (`frontend/src/pages/SpeedRecords/index.tsx` line 24):
```typescript
const speedRecordsQuery = useSpeedRecords('', '', 1000, '', ''); // Change from 100 to 1000
```

**Deploy backend after changes:**
```bash
cd backend
npx wrangler deploy
```

### Issue 5: Missing history for some dogs

**Symptoms:**
- Some dogs have history popup on hover
- Other dogs don't show history
- Dog has multiple records in Google Sheets but no history on site

**Root Cause:**
1. Dog records have different breed values (e.g., "Уиппет" vs "Whippet")
2. Dog records have different name spellings (e.g., "Тайга" vs "Тая")
3. Records are in different sheets with slight variations

**Solution:**
1. Check Google Sheets data for consistency
2. Verify grouping key matches expected behavior
3. Check if records are actually in different sheets

**Debug:**
```bash
# Check specific dog in database
npx wrangler d1 execute pc-db --remote --command="SELECT * FROM speed_records WHERE name LIKE '%Тайга%'"

# Check deduplication logs
npx tsx backend/scripts/speed/fetch-speed-records.ts
# Look for "After deduplication" line
```

### Issue 6: Duplicate records visible

**Symptoms:**
- Same dog appears multiple times in table
- Same record appears with different IDs
- Inconsistent data

**Root Cause:**
Deduplication logic not working correctly or records have slight variations.

**Solution:**
1. Check deduplication key in `fetch-speed-records.ts`
2. Verify deduplication includes all necessary fields: `name + breed + sex + date + speed_km_h`
3. Check if records have different dates (different records, not duplicates)

**Debug:**
```bash
# Check for duplicates in database
npx wrangler d1 execute pc-db --remote --command="SELECT name, breed, date, COUNT(*) as count FROM speed_records GROUP BY name, breed, date HAVING count > 1"
```

## Debugging Checklist

When debugging Speed Records issues:

1. **Check database state:**
   ```bash
   npx wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) as total FROM speed_records"
   ```
   - Should be ~187 records
   - If >200, clean database and reload

2. **Check specific dog:**
   ```bash
   npx wrangler d1 execute pc-db --remote --command="SELECT * FROM speed_records WHERE name='Тайга' AND breed='Салюки'"
   ```
   - Should have 3 records with history
   - Check if history field is not null

3. **Check API response:**
   ```bash
   curl "https://procoursing-stats.antajltube.workers.dev/api/speed-records" | jq '.data | length'
   ```
   - Should return 187 records
   - If 100, check LIMIT settings

4. **Check frontend console:**
   - Look for "Maximum update depth exceeded" errors
   - Check for React warnings
   - Verify no infinite loops

5. **Check grouping consistency:**
   - Backend: `name + breed`
   - Frontend: `name + breed`
   - Must match exactly

## Prevention Tips

1. **Always test locally before deploying:**
   ```bash
   npx tsx backend/scripts/speed/fetch-speed-records.ts
   ```

2. **Monitor database size:**
   - Should be ~187 records
   - Alert if >200 records

3. **Keep grouping keys consistent:**
   - Document all grouping keys
   - Update documentation when changing

4. **Avoid setState in useCallback:**
   - Use useMemo for computed values
   - Use useEffect only for side effects

5. **Deploy backend after API changes:**
   - LIMIT changes require deployment
   - Route changes require deployment

## Related Files

- **Backend script:** `backend/scripts/speed/fetch-speed-records.ts`
- **Backend routes:** `backend/src/routes/speed.ts`
- **Frontend component:** `frontend/src/pages/SpeedRecords/index.tsx`
- **API hook:** `frontend/src/hooks/useApi.ts`
- **Documentation:** `docs/SPEED_RECORDS.md`
- **GitHub Actions:** `.github/workflows/update-speed-records.yml`
