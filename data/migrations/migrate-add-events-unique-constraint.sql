-- Миграция: добавление UNIQUE constraint для предотвращения дубликатов событий без results_url
-- Проблема: NULL значения в results_url не считаются равными, что позволяет создавать дубликаты
-- Решение: добавляем UNIQUE на (date_start, title, location, event_type)

-- Отключаем foreign key constraints на время миграции
PRAGMA foreign_keys = OFF;

-- Сначала удаляем существующие дубликаты
DELETE FROM events 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM events 
  GROUP BY date_start, title, location, event_type
);

-- Удаляем view которые зависят от таблицы events
DROP VIEW IF EXISTS v_top_by_placement;
DROP VIEW IF EXISTS v_top_by_score;

-- Добавляем новый UNIQUE constraint
-- SQLite не поддерживает ALTER TABLE ADD CONSTRAINT, поэтому пересоздаем таблицу
CREATE TABLE IF NOT EXISTS events_new (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  year          INTEGER NOT NULL,
  date_start    TEXT NOT NULL,
  date_end      TEXT,
  rank_label    TEXT,
  event_type    TEXT NOT NULL,
  title         TEXT,
  host_club     TEXT,
  region        TEXT,
  location      TEXT,
  catalog_url   TEXT,
  results_url   TEXT UNIQUE,
  confirmed     INTEGER DEFAULT 0,
  scraped_at    TEXT DEFAULT (datetime('now')),
  competition_kind TEXT,
  competition_type TEXT,
  last_modified TEXT,
  track_schemes TEXT,
  judges        TEXT,
  UNIQUE(date_start, title, location, event_type)
);

-- Копируем данные из старой таблицы
INSERT INTO events_new 
SELECT * FROM events;

-- Удаляем старую таблицу
DROP TABLE events;

-- Переименовываем новую таблицу
ALTER TABLE events_new RENAME TO events;

-- Восстанавливаем индексы
CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Восстанавливаем view
CREATE VIEW IF NOT EXISTS v_top_by_placement AS
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  e.year,
  SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
  SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
  SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
  COUNT(*) AS total_starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
GROUP BY d.id, e.year
ORDER BY e.year DESC, gold DESC, silver DESC, bronze DESC;

CREATE VIEW IF NOT EXISTS v_top_by_score AS
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  e.year,
  MAX(r.total_score) AS best_score,
  ROUND(AVG(r.total_score), 2) AS avg_score,
  COUNT(*) AS total_starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
GROUP BY d.id, e.year
ORDER BY e.year DESC, best_score DESC;
