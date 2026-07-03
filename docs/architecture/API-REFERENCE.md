# API Reference — Документация API

Полная документация API ProCoursing Stats.

## Base URL

**Production:** `https://procoursing-stats.antajltube.workers.dev`
**Development:** `http://127.0.0.1:8787`

## CORS

API поддерживает CORS с wildcard:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept
```

## Endpoints

### Admin Endpoints

#### POST /api/admin/import-results
Загрузка результатов соревнований в базу данных.

**Авторизация:** Требуется заголовок `X-Admin-Token` со значением ADMIN_API_TOKEN (хранится как секрет в Cloudflare)

**Тело запроса:**
```json
{
  "dogs": [
    {
      "name_lat": "DOG NAME",
      "breed": "ПОРОДА",
      "name_ru": "Кличка",
      "pedigree_url": null
    }
  ],
  "results": [
    {
      "name_lat": "DOG NAME",
      "breed": "ПОРОДА",
      "results_url": "http://procoursing.ru/...",
      "breed_class": "Класс",
      "placement": 1,
      "total_score": 150.5,
      "judge_count": 2,
      "qualification": "Квалификация",
      "vc": null,
      "status": "finished",
      "raw_scores_json": "{}",
      "raw_text": "исходная строка",
      "judges": "судьи",
      "status_reason": null
    }
  ],
  "events": [
    {
      "results_url": "http://procoursing.ru/...",
      "judges": "Судьи",
      "track_schemes": [{"number":1,"url":"http://...","name":"Схема трассы","length":"700 м"}]
    }
  ]
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Import completed",
  "stats": {
    "dogsInserted": 880,
    "resultsInserted": 2675,
    "eventsUpdated": 42,
    "totalDogs": 880,
    "totalResults": 2675,
    "totalEvents": 42
  }
}
```

#### POST /api/admin/delete-results/:eventId
Удаление результатов для конкретного события.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Пример:**
```
POST /api/admin/delete-results/1308
Headers: X-Admin-Token: secret
```

**Ответ:**
```json
{
  "success": true,
  "message": "Results deleted",
  "eventId": "1308"
}
```

**Особенности:**
- Удаляет все результаты для указанного event_id
- Полезно для перезагрузки данных после исправления парсера
- Пакетная обработка данных (BATCH_SIZE = 100)
- Автоматическое определение dog_id по name_lat и breed
- Автоматическое определение event_id по results_url
- Валидация данных и логирование ошибок
- Обновление событий с судьями и схемами трасс (опционально)

#### POST /api/admin/reparse-coursing
Перепарсинг событий курсинга.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Ответ:**
```json
{
  "success": true,
  "message": "Reparse completed",
  "result": { ... }
}
```

#### POST /api/recreate-views
Пересоздание view для топ-рейтингов.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Ответ:**
```json
{
  "success": true,
  "message": "Views recreated successfully"
}
```

### Top Ratings

#### GET /api/top/placement
Топ по местам (медальный зачёт).

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `year` (опционально) — фильтр по году
- `minStarts` (опционально) — минимальное количество стартов
- `limit` (опционально) — лимит записей
- `offset` (опционально) — смещение

**Пример:**
```
GET /api/top/placement?breed=САЛЮКИ&year=2025&minStarts=5&limit=10&offset=0
```

**Ответ:**
```json
{
  "results": [
    {
      "dog_id": 1,
      "name_lat": "DOG NAME",
      "name_ru": "Кличка",
      "breed": "САЛЮКИ",
      "year": 2025,
      "gold": 5,
      "silver": 3,
      "bronze": 2,
      "total_starts": 10
    }
  ]
}
```

#### GET /api/top/score
Топ по очкам.

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `year` (опционально) — фильтр по году
- `minStarts` (опционально) — минимальное количество стартов
- `limit` (опционально) — лимит записей
- `offset` (опционально) — смещение

**Пример:**
```
GET /api/top/score?breed=САЛЮКИ&year=2025&minStarts=5&limit=10&offset=0
```

**Ответ:**
```json
{
  "results": [
    {
      "dog_id": 1,
      "name_lat": "DOG NAME",
      "name_ru": "Кличка",
      "breed": "САЛЮКИ",
      "year": 2025,
      "best_score": 95.5,
      "avg_score": 82.3,
      "total_starts": 10
    }
  ]
}
```

#### GET /api/top/speed
Топ по скорости (racing).

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `year` (опционально) — фильтр по году
- `minStarts` (опционально) — минимальное количество стартов
- `limit` (опционально) — лимит записей
- `offset` (опционально) — смещение

**Пример:**
```
GET /api/top/speed?breed=САЛЮКИ&year=2025&minStarts=5&limit=10&offset=0
```

**Ответ:**
```json
{
  "results": [
    {
      "dog_id": 1,
      "name_lat": "DOG NAME",
      "name_ru": "Кличка",
      "breed": "САЛЮКИ",
      "year": 2025,
      "best_speed": 59.23,
      "avg_speed": 55.12,
      "total_starts": 5
    }
  ]
}
```

### Dogs

#### GET /api/dogs/:id
Профиль собаки с раздельной статистикой для курсинга и racing.

**Пример:**
```
GET /api/dogs/1
```

**Ответ:**
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
    "avg_speed": "55.12",
    "gold": 2,
    "silver": 1,
    "bronze": 1
  }
}
```

#### GET /api/breeds
Список всех пород.

**Пример:**
```
GET /api/breeds
```

**Ответ:**
```json
{
  "breeds": ["САЛЮКИ", "АФГАНСКАЯ БОРЗАЯ", "ИРЛАНДСКИЙ ВОЛКОДАВ"]
}
```

#### GET /api/donino-dog/:name/:breed
Профиль собаки Донино с статистикой скорости и бегов.

**Параметры:**
- `name` — кличка собаки (латиница)
- `breed` — порода собаки

**Пример:**
```
GET /api/donino-dog/Тайга/Салюки
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "name": "Тайга",
    "breed": "Салюки",
    "speedRecords": [
      {
        "speed_km_h": 58.5,
        "date": "15.03.2026",
        "screenshot_url": "https://..."
      }
    ],
    "coursingRecords": [
      {
        "event_date": "15.03.2026",
        "placement": 1,
        "total_score": 95.5
      }
    ],
    "speedStats": {
      "total": 3,
      "best": 58.5,
      "avg": 56.2
    },
    "coursingStats": {
      "total": 5,
      "best_score": 95.5,
      "avg_score": 82.3
    }
  }
}
```

### Competitions

#### GET /api/competitions
Список соревнований с фильтром по году.

**Параметры:**
- `year` (опционально) — фильтр по году (`events.year` или год из `date_start`)

**Поля ответа (дополнительно к базовым):**
- `judges` — строка судей с procoursing.ru
- `participants_count` — число уникальных собак в `results` для события
- `competition_kind`, `competition_type` — вид и тип соревнования

**Пример:**
```
GET /api/competitions?year=2025
```

**Ответ:**
```json
{
  "competitions": [
    {
      "id": 1,
      "year": 2025,
      "date_start": "2025-04-04",
      "date_end": null,
      "rank_label": "ЧРКФ",
      "event_type": "coursing",
      "title": "Чемпионат РКФ по курсингу",
      "host_club": "Клуб курсинга",
      "region": "Московская область",
      "location": "Москва",
      "results_url": "http://procoursing.ru/...",
      "judges": "Иванов И.И. - главный судья",
      "participants_count": 42,
      "competition_kind": "Чемпионат РКФ",
      "competition_type": "Курсинг"
    }
  ]
}
```

#### GET /api/competitions/:id
Детальная информация о соревновании.

**Пример:**
```
GET /api/competitions/1
```

**Ответ:**
```json
{
  "id": 1,
  "year": 2025,
  "date_start": "2025-04-04",
  "date_end": null,
  "rank_label": "ЧРКФ",
  "event_type": "coursing",
  "title": "Чемпионат РКФ по курсингу",
  "host_club": "Клуб курсинга",
  "region": "Московская область",
  "location": "Москва",
  "results_url": "http://procoursing.ru/...",
  "judges": "Иванов И.И., Петров П.П.",
  "track_schemes": [...]
}
```

#### GET /api/competitions/:id/results
Результаты соревнования.

**Пример:**
```
GET /api/competitions/1/results
```

**Ответ:**
```json
{
  "results": [
    {
      "id": 1,
      "event_id": 1,
      "dog_id": 1,
      "breed_class": "САЛЮКИ - Стандартная - Сука",
      "catalog_no": 12345,
      "placement": 1,
      "total_score": 95.5,
      "qualification": "CACL, RegCACL",
      "status": "finished",
      "raw_scores_json": "{...}"
    }
  ]
}
```

#### GET /api/dogs/:id/competitions
Список соревнований собаки.

**Пример:**
```
GET /api/dogs/1/competitions
```

**Ответ:**
```json
{
  "competitions": [
    {
      "event_id": 1,
      "date_start": "2025-04-04",
      "date_end": null,
      "title": "Чемпионат РКФ по курсингу",
      "event_type": "coursing",
      "competition_kind": "Чемпионат РКФ",
      "results_url": "http://procoursing.ru/...",
      "location": "Москва",
      "placement": 1,
      "total_score": 95.5,
      "status": "finished"
    }
  ]
}
```

### Speed Records

#### GET /api/speed-records
Рекорды скорости Донино.

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `sex` (опционально) — фильтр по полу ('С' или 'К')
- `limit` (опционально) — лимит записей (по умолчанию **1000**; клиенты: таблица Донино — 1000, `Stats.tsx` — 10000)
- `offset` (опционально) — смещение
- `search` (опционально) — поиск по кличке
- `year` (опционально) — фильтр по году

**Пример:**
```
GET /api/speed-records?breed=САЛЮКИ&sex=С&limit=50&offset=0
```

**Ответ:**
```json
{
  "records": [
    {
      "id": 1,
      "breed": "САЛЮКИ",
      "sex": "С",
      "name": "Кличка",
      "speed_km_h": 59.23,
      "date": "15.03.2025",
      "screenshot_url": "https://...",
      "status": "new",
      "history": [...]
    }
  ]
}
```

### Judges

#### GET /api/judges
Список судей с фильтрами.

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `discipline` (опционально) — фильтр по дисциплине (coursing, bzmp, racing)

**Пример:**
```
GET /api/judges?breed=САЛЮКИ&discipline=coursing
```

**Ответ:**
```json
{
  "judges": [
    {
      "id": "Лукина Д.М.",
      "name": "Лукина Д.М.",
      "total_evaluations": 150,
      "total_evaluations_count": 30,
      "avg_score": 4.5,
      "unique_breeds": 5,
      "unique_disciplines": 2,
      "unique_events": 15
    }
  ],
  "available_breeds": ["САЛЮКИ", "АФГАНСКАЯ БОРЗАЯ", ...]
}
```

#### GET /api/judges/:id/details
Детальная статистика судьи.

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `discipline` (опционально) — фильтр по дисциплине

**Пример:**
```
GET /api/judges/Лукина%20Д.М./details?breed=САЛЮКИ
```

**Ответ:**
```json
{
  "judge_name": "Лукина Д.М.",
  "total_evaluations": 150,
  "avg_score": 4.5,
  "breed_stats": [
    {
      "breed": "САЛЮКИ",
      "count": 100,
      "evaluations_count": 20,
      "avg_score": 4.6,
      "min_score": 3.5,
      "max_score": 5.0,
      "dogs": [...]
    }
  ],
  "criteria_stats": [...]
}
```

### Years

#### GET /api/years
Список годов с событиями.

**Пример:**
```
GET /api/years
```

**Ответ:**
```json
{
  "years": [2023, 2024, 2025, 2026]
}
```

---

## Admin Endpoints

#### POST /api/admin/recreate-views
Пересоздание view'ов в БД.

**Headers:**
- `X-Admin-Token` — секретный токен

**Пример:**
```
POST /api/admin/recreate-views
Headers: X-Admin-Token: secret
```

## Error Handling

Все эндпоинты возвращают ошибки в формате:

```json
{
  "error": "Error message"
}
```

Коды ошибок:
- `400` — неверные параметры
- `404` — ресурс не найден
- `500` — внутренняя ошибка сервера

## Rate Limiting

Текущая версия не имеет rate limiting. Будьте вежливы к API и не делайте избыточные запросы.

## Admin Token

Для admin endpoints требуется заголовок `X-Admin-Token`. Токен настраивается через переменную окружения `ADMIN_TOKEN` в Cloudflare Worker.
