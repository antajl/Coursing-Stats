# 03. Database Schema — D1 (SQLite)

## Tables

### events

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| year | INTEGER | Год события |
| date_start | TEXT | Дата начала (ISO 'YYYY-MM-DD') |
| date_end | TEXT | Дата окончания (для многодневных) |
| rank_label | TEXT | Ранг ('ЧРКФ', 'CACL', 'РКФ' и т.п.) |
| event_type | TEXT | 'coursing' \| 'bzmp' \| 'racing' |
| title | TEXT | Название состязания |
| host_club | TEXT | Принимающая организация |
| region | TEXT | Регион |
| location | TEXT | Место проведения |
| catalog_url | TEXT | Ссылка на каталог PDF |
| results_url | TEXT UNIQUE | Ссылка на результаты (естественный ключ) |
| confirmed | INTEGER | Флаг подтверждения ('+') |
| scraped_at | TEXT | Время скрапинга |

### dogs

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| name_lat | TEXT | Каноническое имя латиницей |
| name_ru | TEXT | Имя на русском |
| breed | TEXT | Порода |
| sex | TEXT | 'M' \| 'F' |
| pedigree_no | TEXT | Номер родословной |
| microchip | TEXT | Микрошильд |
| owner | TEXT | Владелец |
| pedigree_url | TEXT | Ссылка на внешний архив родословных |
| merged_into_dog_id | INTEGER FK | Для ручной склейки дублей |
| created_at | TEXT | Время создания |

**UNIQUE:** `(name_lat, breed)`

### results

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | |
| event_id | INTEGER FK | Ссылка на events |
| dog_id | INTEGER FK | Ссылка на dogs |
| breed_class | TEXT | Заголовок группы ('Афганская - Стандартная - Сука') |
| catalog_no | INTEGER | Каталожный номер |
| placement | INTEGER | Место (NULL если не финишировал) |
| total_score | REAL | Нормализованный итоговый балл (для coursing/bzmp) |
| qualification | TEXT | 'CACL, RegCACL' и т.п. |
| status | TEXT | 'finished' \| 'disqualified' \| 'withdrawn' \| 'dns' |
| raw_scores_json | TEXT | JSON с детальными данными (баллы или скорость) |
| raw_text | TEXT | Исходная строка для отладки |

**UNIQUE:** `(event_id, dog_id, breed_class)`

**raw_scores_json структура:**

Для Coursing/БЗМП:
```json
{
  "heat1": [score1, score2, score3],
  "sum1": total1,
  "heat2": [score1, score2, score3],
  "sum2": total2
}
```

Для Racing:
```json
{
  "heat1": {
    "num": 1,
    "bib": "red",
    "time": 21.88,
    "speed": 16.45
  },
  "heat2": { ... },
  "heat3": { ... },
  "distance": 480
}
```
Скорость в м/с, конвертируется в км/ч в API (×3.6).

## Views

### v_top_by_placement

Медальный зачёт: сортировка по золоту, серебру, бронзе.

```sql
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
  SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
  SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
  COUNT(*) AS starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
WHERE r.status = 'finished'
GROUP BY d.id
ORDER BY gold DESC, silver DESC, bronze DESC;
```

### v_top_by_score

Топ по очкам: лучший результат, средний балл, число стартов.

```sql
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  MAX(r.total_score) AS best_score,
  ROUND(AVG(r.total_score), 1) AS avg_score,
  COUNT(*) AS starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
WHERE r.status = 'finished' AND r.total_score IS NOT NULL
GROUP BY d.id
ORDER BY best_score DESC;