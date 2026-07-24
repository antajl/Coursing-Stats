# API Reference — Документация API

> **ИИ:** карта задач — [README.md](README.md). Runtime данные — [03-DATA.md](03-DATA.md).

**Только локальный admin/dev API** (`npm run dev` → `:8787`). Публичный прод этот API **не** вызывает — сайт читает `/data/v1/` с CDN (`frontend/src/lib/staticData.ts`).

Секции **Top Ratings / Dogs / Competitions / …** ниже — legacy/debug эндпоинты local-dev (и бывшего Worker); фронт на проде их не использует.

## Base URL

**Локальная админка / dev:** `http://127.0.0.1:8787` (`npm run dev`)

**Legacy Worker URL (не деплоится в CI):** `https://api.coursing-stats.ru`

## CORS

API поддерживает CORS с wildcard:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept
```

## Endpoints

### Admin Endpoints

#### GET /api/admin/events
Список исторических событий (год < 2026) для редактирования.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Параметры:**
- `year` (опционально) — фильтр по году

**Пример:**
```
GET /api/admin/events?year=2015
Headers: X-Admin-Token: secret
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2500,
      "year": 2015,
      "date_start": "2015-08-08",
      "date_end": "2015-08-09",
      "title": "Дружественные забеги",
      "location": "Московская область, Сергиево-Посадский р-н",
      "event_type": "coursing",
      "competition_kind": "",
      "results_url": "http://procoursing.ru/results/2015-08-08_F/",
      "judges": null
    }
  ]
}
```

#### GET /api/admin/events/:id/results
Результаты события для редактирования.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Пример:**
```
GET /api/admin/events/2500/results
Headers: X-Admin-Token: secret
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "event_id": 2500,
      "dog_id": 1,
      "name_lat": "DOG NAME",
      "name_ru": "Кличка",
      "breed": "САЛЮКИ",
      "breed_class": "Стандартная - Сука",
      "placement": 1,
      "total_score": 95.5,
      "qualification": "CACL",
      "vc": null,
      "status": "finished"
    }
  ]
}
```

#### PUT /api/admin/events/:id
Обновление данных события.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Тело запроса:**
```json
{
  "title": "CACL (Курсинг борзых)",
  "full_title": "Национальные сертификатные состязания…",
  "location": "Новая локация",
  "judges": "Иванов И.И., Петров П.П.",
  "results_url": "http://procoursing.ru/results/..."
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Event updated"
}
```

#### PUT /api/admin/results/:id
Обновление результата.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Тело запроса:**
```json
{
  "placement": 1,
  "total_score": 95.5,
  "qualification": "CACL",
  "vc": null,
  "status": "finished",
  "status_reason": null
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Result updated"
}
```

#### POST /api/admin/results
Создание нового результата.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Тело запроса:**
```json
{
  "event_id": 2500,
  "dog_id": 1,
  "breed_class": "Стандартная - Сука",
  "placement": 1,
  "total_score": 95.5,
  "qualification": "CACL",
  "vc": null,
  "status": "finished"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Result created",
  "id": 12346
}
```

#### DELETE /api/admin/results/:id
Удаление результата.

**Авторизация:** Требуется заголовок `X-Admin-Token`

**Пример:**
```
DELETE /api/admin/results/12345
Headers: X-Admin-Token: secret
```

**Ответ:**
```json
{
  "success": true,
  "message": "Result deleted"
}
```

#### POST /api/admin/import-results
Загрузка результатов соревнований в базу данных.

**Авторизация:** заголовок `X-Admin-Token` = `ADMIN_API_TOKEN` (локально, env)

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

### Top Ratings (legacy / local-dev)

> Публичный рейтинг на проде — из `data/v1/indexes/top-*.json`, не из этих эндпоинтов.

#### GET /api/top/placement
Топ по медалям (медальный зачёт, placement).

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
Топ по очкам (курсинг + БЗМП). **Сортировка по умолчанию:** `sortBy=rating_score` (индекс CS).

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `year` (опционально) — фильтр по году
- `minStarts` (опционально) — минимальное количество стартов
- `sortBy` (опционально) — `rating_score` (default), `avg_judge_score`, `best_judge_score`, `best_score`
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
      "best_score": 370,
      "best_judge_score": 97,
      "avg_judge_score": 87,
      "judge_eval_count": 64,
      "rating_score": 89.28,
      "total_starts": 16
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

### Dogs (legacy / local-dev)

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
Список всех пород (с объединением дубликатов).

Дубликаты пород (например, "НЕМЕЦКАЯ ОВЧАРКА К Ш" и "НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ") объединяются в одно название ("НЕМЕЦКАЯ ОВЧАРКА").

**Пример:**
```
GET /api/breeds
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    { "breed": "АВСТРАЛИЙСКАЯ ОВЧАРКА" },
    { "breed": "АФГАНСКАЯ БОРЗАЯ" },
    { "breed": "НЕМЕЦКАЯ ОВЧАРКА" },
    { "breed": "ПОДЕНКО ИБИЦЕНКО" }
  ]
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

### Competitions (legacy / local-dev)

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
- `limit` (опционально) — лимит записей (по умолчанию **1000**; фронтенд `/speed-records`: `useSpeedRecordsPage.ts` — 1000)
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

Поле `status`: `new` | `improved` | `normal` | `old` — из заливки клички в Google Sheet (`#B6D7A8` → `new`, `#9FC5E8` → `improved`). На UI бейдж `upd` соответствует `improved`. `history` — массив прошлых замеров `{speed_km_h, date}`.

#### GET /api/coursing-records
Зачёты **бегов борзых 350 м** Донино (время в секундах из отдельного Google Sheet).

**Параметры:**
- `breed` (опционально) — фильтр по породе
- `limit` (опционально) — лимит записей (по умолчанию **1000**)
- `search` (опционально) — поиск по кличке, породе, дате
- `year` (опционально) — фильтр по году
- `dog_id` (опционально) — фильтр по ID собаки

**Пример:**
```
GET /api/coursing-records?breed=Уиппет&limit=100
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "breed": "Уиппет",
      "name": "Драм",
      "time_seconds": 22.81,
      "date": "2025-08-20",
      "track_length": 350,
      "history": null,
      "dog_id": 123
    }
  ]
}
```

**Использование во фронтенде:** `/speed-records` — колонка «Бега 350 м» (`DoninoRecordsColumns`, `DoninoStatsColumns`). Скорость для отображения: `1260 / time_seconds` км/ч.

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

Для admin endpoints (только **локально**, `npm run dev`) требуется заголовок `X-Admin-Token`.

- Переменная окружения: `ADMIN_API_TOKEN` (см. `backend/src/local-dev-server.ts`)
- Если не задана — доступ разрешён (предупреждение в консоли)
- На проде админка не деплоится
