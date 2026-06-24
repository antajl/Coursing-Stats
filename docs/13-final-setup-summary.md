# ProCoursing Stats - Final Setup Summary

## Overview
ProCoursing Stats is a dog statistics aggregator for coursing, BZMP, and racing events from procoursing.ru (2015-2026).

## Deployment Status

### Frontend (Cloudflare Pages)
- **URL**: https://795d5761.procoursing-stats.pages.dev
- **Status**: Deployed and live
- **Tech Stack**: React + Vite + TailwindCSS
- **Build Output**: `frontend/dist/`
- **Deployment Command**: `npx wrangler pages deploy dist --project-name procoursing-stats`

### Backend (Cloudflare Worker)
- **URL**: https://procoursing-stats.antajltube.workers.dev
- **Status**: Deployed and live
- **Tech Stack**: Cloudflare Worker + D1 Database
- **Cron Trigger**: Daily at 2 AM UTC (`0 2 * * *`)
- **Deployment Command**: `wrangler deploy`

### Database (Cloudflare D1)
- **Name**: pc-db
- **ID**: a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4
- **Status**: Active with 2026 data

## Current Data Status

### Events
- **Total Events**: 225 (2015-2026)
- **Events with Results**: 16 (all in 2026)
- **Years with Data**: 2026 only
- **Years without Results**: 2015-2025

### Dogs
- **Total Dogs**: 431 (from 2026 results)
- **Total Results**: Loaded from 16 events

### Known Issue: Historical Data
Events for 2015-2025 exist in the database but have no `results_url` values. The scraper (`scrape-year-index.mjs`) did not find result links for older years. This requires investigation of the HTML structure for older years.

## API Endpoints

### GET /api/events
- **Description**: List all events
- **Query Params**: `year`, `breed`
- **Response**: Array of events

### GET /api/top/placement
- **Description**: Top dogs by placement (medal count)
- **Query Params**: `breed`, `year`, `minStarts`
- **Response**: Array with gold/silver/bronze counts

### GET /api/top/score
- **Description**: Top dogs by score
- **Query Params**: `breed`, `year`, `minStarts`
- **Response**: Array with best_score, avg_score, total_starts

### GET /api/dogs/:id
- **Description**: Dog profile with results history
- **Response**: Dog info + results array

### GET /api/breeds
- **Description**: List of all breeds
- **Response**: Array of breed names

### GET /api/years
- **Description**: List of years with events
- **Response**: Array of years

## Frontend Structure

### Pages
- **Events** (`/`): Calendar with filters by year and event type
- **Top Dogs** (`/top`): Two rankings (placement + score) with filters
- **Dog Profile** (`/dog/:id`): Individual dog history

### Features
- Year filter (default: 2026)
- Breed filter
- Minimum starts filter
- Tab switching between rankings
- Responsive design with TailwindCSS
- Modern UI with gradients and shadows

## Configuration Files

### wrangler.toml
```toml
name = "procoursing-stats"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 2 * * *"]  # Daily at 2 AM UTC

[[d1_databases]]
binding = "DB"
database_name = "pc-db"
database_id = "a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4"
```

### vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://procoursing-stats.antajltube.workers.dev',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
```

## Development Workflow

### Local Development
1. **Frontend**: `cd frontend && npm run dev` (http://localhost:5173)
2. **Backend**: `wrangler dev` (for local Worker testing)
3. **Database**: Use `wrangler d1 execute pc-db --remote` for remote queries

### Building Frontend
```bash
cd frontend
npm run build
```

### Deploying Frontend
```bash
cd frontend
npx wrangler pages deploy dist --project-name procoursing-stats
```

### Deploying Backend
```bash
wrangler deploy
```

## Known Limitations

1. **Historical Data**: Only 2026 has results loaded. 2015-2025 events exist but have no results.
2. **Cron Trigger**: Currently only logs events - needs implementation of actual data update logic.
3. **Encoding**: procoursing.ru uses windows-1251 without charset - requires manual decoding (already implemented in `lib/fetch-win1251.mjs`).
4. **Parser**: Only coursing parser is implemented. BZMP and racing parsers are not written yet.

## Next Steps

### High Priority
1. **Implement Cron Update Logic**: Add actual data fetching in the scheduled event handler
2. **Investigate Historical Data**: Fix scraper to find results_url for 2015-2025
3. **Backfill History**: Load results for all years 2015-2025

### Medium Priority
1. **BZMP Parser**: Implement parser for BZMP events
2. **Racing Parser**: Implement parser for racing events
3. **Add Search**: Implement search functionality in frontend
4. **Add Pagination**: Implement pagination for large tables

### Low Priority
1. **Dark Mode**: Add dark mode support
2. **Pedigree Links**: Add external pedigree links to dog profiles
3. **Performance**: Optimize queries and add caching

## Important Notes

- **CORS**: Worker has CORS enabled for all origins (`Access-Control-Allow-Origin: *`)
- **Proxy**: Vite proxy is used in development to avoid CORS issues
- **Views**: Database views (`v_top_by_placement`, `v_top_by_score`) include year filtering
- **Encoding**: Always use `fetchWin1251` for procoursing.ru requests
- **Testing**: Always run `node scripts/test-parser.mjs` before changing parser code

## Contact & Support
- **Source**: procoursing.ru
- **Data License**: Verify with source before commercial use
- **Issues**: Check encoding and parser logic first when data appears corrupted
