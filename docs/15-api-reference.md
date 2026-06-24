# 15. API Reference — Cloudflare Worker Endpoints

## Base URL

**Production:** `https://procoursing-stats.antajltube.workers.dev`
**Development:** `http://127.0.0.1:8787`

## Authentication

No authentication required. All endpoints are public.

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD, PUT, DELETE`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept`

## Endpoints

### GET /api/test

Test endpoint to verify API connectivity and database binding.

**Response:**
```json
{
  "test": [{ "test": 1 }],
  "db": true
}
```

### GET /api/test-view

Test endpoint to verify database views are working.

**Response:**
```json
{
  "results": [...],
  "count": 5
}
```

### GET /api/top/placement

Get top dogs by placement (medal count). Filters by breed and year.

**Query Parameters:**
- `breed` (optional): Filter by breed name
- `year` (optional): Filter by year (e.g., "2026")

**Example:**
```
GET /api/top/placement?breed=Saluki&year=2026
```

**Response:**
```json
[
  {
    "dog_id": 1,
    "name_lat": "Saluki Desert Wind",
    "name_ru": "Салюки Пустынный Ветер",
    "breed": "Saluki",
    "year": 2026,
    "gold": 5,
    "silver": 3,
    "bronze": 2,
    "total_starts": 10
  }
]
```

### GET /api/top/score

Get top dogs by score. Filters by breed and year.

**Query Parameters:**
- `breed` (optional): Filter by breed name
- `year` (optional): Filter by year (e.g., "2026")

**Example:**
```
GET /api/top/score?breed=Saluki&year=2026
```

**Response:**
```json
[
  {
    "dog_id": 1,
    "name_lat": "Saluki Desert Wind",
    "name_ru": "Салюки Пустынный Ветер",
    "breed": "Saluki",
    "year": 2026,
    "best_score": 95.5,
    "avg_score": 82.3,
    "total_starts": 10
  }
]
```

### GET /api/dogs/:id

Get detailed dog profile with separate statistics for coursing and racing.

**Path Parameters:**
- `id`: Dog ID (integer)

**Example:**
```
GET /api/dogs/1
```

**Response:**
```json
{
  "dog_id": 1,
  "name_lat": "Saluki Desert Wind",
  "name_ru": "Салюки Пустынный Ветер",
  "breed": "Saluki",
  "sex": "M",
  "owner": "Owner Name",
  "coursing_stats": {
    "total_starts": 10,
    "best_score": 95.5,
    "avg_score": 82.3,
    "gold": 5,
    "silver": 3,
    "bronze": 2
  },
  "racing_stats": {
    "total_starts": 5,
    "best_speed": "59.23",
    "avg_speed": "55.12"
  }
}
```

**Notes:**
- `coursing_stats` includes data from both coursing and bzmp events
- `racing_stats` includes data from racing events only
- Speed values are in km/h (converted from m/s in database)
- If dog has no racing data, `racing_stats` will have `total_starts: 0` and `null` for speeds

### GET /api/breeds

Get list of all unique breeds in the database.

**Response:**
```json
[
  { "breed": "Afghan Hound" },
  { "breed": "Saluki" },
  { "breed": "Greyhound" }
]
```

### GET /api/years

Get list of all years with events in the database.

**Response:**
```json
[
  { "year": 2026 },
  { "year": 2025 },
  { "year": 2024 },
  { "year": 2023 }
]
```

### GET /api/events

Get list of events with optional year filter.

**Query Parameters:**
- `year` (optional): Filter by year (e.g., "2026")

**Example:**
```
GET /api/events?year=2026
```

**Response:**
```json
[
  {
    "id": 1,
    "year": 2026,
    "date_start": "2026-04-04",
    "date_end": null,
    "rank_label": "ЧРКФ",
    "event_type": "coursing",
    "competition_kind": "ЧРКФ",
    "competition_type": "Курсинг борзых",
    "title": "Чемпионат РКФ по курсингу",
    "host_club": "Клуб борзых",
    "region": "Москва",
    "location": "Москва",
    "catalog_url": "http://procoursing.ru/2026/2026-04-04_Catalog_Coursing.pdf",
    "results_url": "http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html",
    "confirmed": 1,
    "scraped_at": "2026-04-05T10:00:00Z"
  }
]
```

### POST /api/update/trigger

Trigger manual data update (placeholder for future implementation).

**Response:**
```json
{
  "success": true,
  "message": "Update triggered successfully",
  "note": "For automatic updates, configure GitHub Actions or external server. See DATA_UPDATE_STRATEGY.md for details."
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful request
- `404 Not Found` - Resource not found (e.g., dog ID doesn't exist)
- `500 Internal Server Error` - Server error

## Data Types

### Event Types
- `coursing` - Coursing events
- `bzmp` - БЗМП events
- `racing` - Racing events

### Status Values
- `finished` - Dog finished the event
- `disqualified` - Dog was disqualified
- `withdrawn` - Dog withdrew
- `dns` - Dog did not start

## Rate Limiting

Currently no rate limiting is implemented. Be respectful with API usage.

## Future Enhancements

- Add pagination for large result sets
- Implement rate limiting
- Add caching headers
- Add WebSocket support for real-time updates
- Add authentication for admin endpoints
