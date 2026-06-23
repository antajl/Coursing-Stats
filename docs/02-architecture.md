# 02. Architecture — Cloudflare Pages + Worker + D1

## High-Level Architecture

```
Источник (procoursing.ru)
   │  Cron Trigger (Cloudflare Worker, раз в день/неделю)
   ▼
Скрапер/парсер (Node, локально для бэкафилла; Worker — для инкремента)
   │
   ▼
Cloudflare D1 (events, dogs, results)
   │
   ▼
Pages-сайт (фронтенд: профиль собаки, топы, фильтры)
```

## Components

### 1. Scraper (Node.js)

| Script | Purpose |
|--------|---------|
| `scripts/scrape-year-index.mjs` | Парсит `s_{YEAR}.html`, получает список событий |
| `lib/fetch-win1251.mjs` | Загрузка страниц с декодированием windows-1251 |
| `parse-results-coursing.mjs` | Парсер результатов курсинга |
| `parse-results-bzmp.mjs` | Парсер БЗМП (не реализован) |
| `parse-results-racing.mjs` | Парсер бега (не реализован) |

### 2. Database (D1)

**Tables:**
- `events` — мероприятия
- `dogs` — собаки
- `results` — результаты выступлений

**Views (для топов):**
- `v_top_by_placement` — медальный зачёт
- `v_top_by_score` — топ по очкам

### 3. Worker (API)

```javascript
GET /api/top/placement?breed=&year=&minStarts=
GET /api/top/score?breed=&year=&minStarts=
GET /api/dogs/:id
GET /api/breeds
GET /api/years
```

### 4. Frontend (Pages)

- `/dogs/:id` — профиль собаки (таймлайн, график баллов, титулы)
- `/top/placement` — топ по местам
- `/top/score` — топ по очкам
- Фильтры: порода (multiselect), год/диапазон лет, сортировка