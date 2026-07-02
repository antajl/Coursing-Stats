-- Индексы для оптимизации производительности
-- Создано: 2026-07-02

-- Индекс для частых запросов по dog_id в results
CREATE INDEX IF NOT EXISTS idx_results_dog_id ON results(dog_id);

-- Индекс для фильтрации по event_id в results
CREATE INDEX IF NOT EXISTS idx_results_event_id ON results(event_id);

-- Индекс для фильтрации по status в results
CREATE INDEX IF NOT EXISTS idx_results_status ON results(status);

-- Композитный индекс для запросов результатов собаки с фильтром по статусу
CREATE INDEX IF NOT EXISTS idx_results_dog_status ON results(dog_id, status);

-- Индекс для фильтрации событий по году
CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);

-- Индекс для фильтрации событий по типу
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Композитный индекс для событий по году и типу
CREATE INDEX IF NOT EXISTS idx_events_year_type ON events(year, event_type);

-- Индекс для поиска собак по породе
CREATE INDEX IF NOT EXISTS idx_dogs_breed ON dogs(breed);

-- Индекс для поиска собак по имени (латиница)
CREATE INDEX IF NOT EXISTS idx_dogs_name_lat ON dogs(name_lat);

-- Уникальный индекс для dogs (name_lat, breed) - должен уже существовать, но проверим
CREATE UNIQUE INDEX IF NOT EXISTS idx_dogs_unique ON dogs(name_lat, breed);
