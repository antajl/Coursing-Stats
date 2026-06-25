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
Pages-сайт (фронтенд: React, профиль собаки, топы, фильтры, tooltip)
```

## Components

### 1. Scraper (Node.js)

| Script | Path | Purpose |
|--------|------|---------|
| `backend/scripts/scrape-year-index.mjs` | `backend/scripts/` | Парсит `s_{YEAR}.html`, получает список событий |
| `backend/lib/fetch-win1251.mjs` | `backend/lib/` | Загрузка страниц с декодированием windows-1251 |
| `backend/parsers/parse-results-coursing.mjs` | `backend/parsers/` | Парсер результатов курсинга |
| `backend/parsers/parse-results-bzmp.mjs` | `backend/parsers/` | Парсер БЗМП |
| `backend/parsers/parse-results-racing.mjs` | `backend/parsers/` | Парсер бега с извлечением данных о скорости |
| `backend/scripts/load-results.mjs` | `backend/scripts/` | Загрузка результатов в D1 |
| `backend/scripts/load-events.mjs` | `backend/scripts/` | Загрузка событий в D1 |

### 2. Database (D1)

**Tables:**
- `events` — мероприятия (event_type: coursing, bzmp, racing)
- `dogs` — собаки
- `results` — результаты выступлений (raw_scores_json хранит детальные данные)

**Views (для топов):**
- `v_top_by_placement` — медальный зачёт (курсинг + БЗМП)
- `v_top_by_score` — топ по очкам (курсинг + БЗМП)

### 3. Worker (API)

```javascript
GET /api/top/placement?breed=&year=&minStarts=
GET /api/top/score?breed=&year=&minStarts=
GET /api/top/speed?breed=&year=&minStarts=
GET /api/dogs/:id
GET /api/breeds
GET /api/years
GET /api/events?year=
```

**Dog Profile API Response Structure:**
```json
{
  "dog_id": 1,
  "name_lat": "Dog Name",
  "name_ru": "Кличка",
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

### 4. Frontend (Pages + React)

**Directory:** `frontend/src/`

**Pages:**
- `/` — главная страница с навигацией
- `/top/placement` — топ по местам (медальный зачёт)
- `/top/score` — топ по очкам
- `/events` — календарь событий

**Components:**
- `frontend/src/components/DogTooltip.jsx` — tooltip с раздельной статистикой курсинга и бегов (сайд-бай-сайд layout)
- `frontend/src/components/DogStatsTable.jsx` — таблица статистики собак с сортировкой
- `frontend/src/App.jsx` — главный компонент с навигацией и кнопкой обновления

**Services:**
- `frontend/src/services/api.js` — API сервис для общения с backend

**Data:**
- `frontend/src/data/mockData.js` — мок данные для разработки

**Features:**
- Фильтры по породе и году
- Поиск по имени собаки
- Tooltip при наведении на имя собаки
- Кнопка обновления данных в хедере
- Адаптивный дизайн