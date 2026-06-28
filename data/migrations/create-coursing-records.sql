-- Таблица рекордов курсинга Донино
CREATE TABLE IF NOT EXISTS coursing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  breed TEXT NOT NULL,
  name TEXT NOT NULL,
  time_seconds REAL NOT NULL,
  date TEXT NOT NULL,
  track_length INTEGER DEFAULT 350,
  history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по породе
CREATE INDEX IF NOT EXISTS idx_coursing_records_breed ON coursing_records(breed);

-- Индекс для быстрого поиска по имени
CREATE INDEX IF NOT EXISTS idx_coursing_records_name ON coursing_records(name);

-- Индекс для сортировки по времени
CREATE INDEX IF NOT EXISTS idx_coursing_records_time ON coursing_records(time_seconds);
