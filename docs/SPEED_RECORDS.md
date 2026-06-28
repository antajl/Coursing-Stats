# Speed Records Documentation

## Overview
Speed records are fetched from Google Sheets and displayed on the website to show the best running speeds for dogs.

## Data Source
- **Google Sheets URL**: https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=csv&gid=1787526009
- **Sheets**: "2026", "2025", "2025 по породам", "Абсолютный зачёт", "старые личные рекорды"
- **Columns**: Порода, Пол, Кличка, Лучшая скорость (км/ч), Дата, Скриншот

## Data Processing Pipeline

### 1. Fetching
- Script: `backend/scripts/speed/fetch-speed-records.ts`
- Downloads XLSX file from Google Sheets
- Parses all sheets and extracts records

### 2. Deduplication
- **Purpose**: Remove duplicate records that may exist in different sheets
- **Deduplication key**: `name + breed + sex + date + speed_km_h`
- **Example**: If the same record (same dog, same date, same speed) appears in both "2025" and "2025 по породам" sheets, only one is kept
- **Result**: 418 records → 187 unique records (231 duplicates removed)

### 3. Grouping for History
- **Grouping key**: `name + breed`
- **Purpose**: Group records by dog to form history
- **Logic**: Dogs with the same name and breed are considered the same dog, regardless of sex
- **Example**: "Тайга" + "Салюки" → all records for this dog are grouped together

### 4. History Formation
- For each dog, records are sorted by date (newest to oldest)
- For each record, history contains all other records for that dog (except current)
- History format: `[{speed_km_h, date}, ...]`
- **Example**: If Тайга has 3 records (55 km/h on 11.05.2026, 54 km/h on 29.11.2025, 51 km/h on 06.07.2025), then:
  - Record 1 (55 km/h): history = [{54 km/h, 29.11.2025}, {51 km/h, 06.07.2025}]
  - Record 2 (54 km/h): history = [{55 km/h, 11.05.2026}, {51 km/h, 06.07.2025}]
  - Record 3 (51 km/h): history = [{55 km/h, 11.05.2026}, {54 km/h, 29.11.2025}]

### 5. Database Storage
- **Table**: `speed_records`
- **Fields**: breed, sex, name, speed_km_h, date, screenshot_url, status, history
- **History storage**: JSON string in `history` field
- **Update method**: `INSERT OR REPLACE` (incremental updates, no DELETE)
- **Database**: D1 `pc-db` (remote)

### 6. API Endpoint
- **Endpoint**: `/api/speed-records`
- **Method**: GET
- **Limit**: 1000 records (configurable)
- **Response format**: `{success: true, data: [...]}`

### 7. Frontend Display
- **Component**: `frontend/src/pages/SpeedRecords/index.tsx`
- **Grouping for display**: `name + breed` (one best record per unique dog, matches backend history logic)
- **History display**: Hover over dog name to see history popup
- **Filtering**: By year, breed, sex, search query
- **Sorting**: By any column (name, speed, date, etc.)

## Key Concepts

### Deduplication vs History
- **Deduplication**: Removes exact duplicates (same dog, same date, same speed) from different sheets
- **History**: Groups different records for the same dog (different dates) to show progress over time

### Grouping Keys
- **Deduplication**: `name + breed + sex + date + speed` (very specific)
- **History formation**: `name + breed` (broader, allows same dog with different sex records)
- **Frontend display**: `name + breed` (one record per unique dog, matches backend history logic)

## Statistics
- **Total records (raw)**: 418
- **After deduplication**: 187
- **Unique dogs**: 131
- **Dogs with history**: 39
- **Records with history**: 95

## Running the Script

### Local testing
```bash
npx tsx backend/scripts/speed/fetch-speed-records.ts
```

### Update remote database
```bash
npx tsx backend/scripts/speed/fetch-speed-records.ts --remote
```

### GitHub Actions
- **Workflow**: `.github/workflows/update-speed-records.yml`
- **Schedule**: Daily at 03:00 UTC
- **Action**: Fetches from Google Sheets, deduplicates, groups, forms history, updates D1

## Troubleshooting

### Missing history for some dogs
- Check if the dog has multiple records with different dates
- Check if records are in different sheets with slight variations
- Verify grouping key (name + breed) matches expected behavior

### Duplicate records visible
- Check deduplication logic in `fetch-speed-records.ts`
- Verify deduplication key includes all necessary fields
- Check if records have different dates (different records, not duplicates)

### Wrong grouping
- Check grouping key for history formation (name + breed)
- Check grouping key for frontend display (name + breed)
- Verify data consistency in Google Sheets

### Database has too many records (duplicates)
- **Symptom**: Database has 2000+ records instead of expected ~187
- **Cause**: Multiple `INSERT OR REPLACE` operations without cleaning old data
- **Solution**: Clean database before loading new data
  ```bash
  npx wrangler d1 execute pc-db --remote --command="DELETE FROM speed_records"
  npx tsx backend/scripts/speed/fetch-speed-records.ts --remote
  ```
- **Prevention**: Always clean database before major data reloads

### Frontend shows only one record per dog
- **Symptom**: Dog shows only best result, history not visible on hover
- **Cause**: Frontend grouping key doesn't match backend history grouping key
- **Solution**: Ensure both use same grouping key (name + breed)
  - Backend: `fetch-speed-records.ts` line 240: `key = ${record.name}_${record.breed}`
  - Frontend: `index.tsx` line 105: `key = ${record.name}_${record.breed}`

### Infinite React render loop
- **Symptom**: "Maximum update depth exceeded" error in console
- **Cause**: setState inside useCallback or useEffect with wrong dependencies
- **Solution**: 
  - Remove setState from useCallback, return filtered data instead
  - Use useMemo for filtered data
  - Use useEffect only to update state from useMemo result
  - Example: See `frontend/src/pages/SpeedRecords/index.tsx` lines 146-231

### API returns only 100 records
- **Symptom**: Frontend shows limited number of dogs despite more in database
- **Cause**: Default LIMIT in API endpoint is 100
- **Solution**: Increase LIMIT in both backend and frontend
  - Backend: `backend/src/routes/speed.ts` change LIMIT 100 to 1000
  - Frontend: `useSpeedRecords('', '', 1000, '', '')` change 100 to 1000
  - Deploy backend after changes: `npx wrangler deploy`
