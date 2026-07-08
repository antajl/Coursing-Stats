-- Миграция: добавление track_type в таблицу speed_records
-- Выполни: npx wrangler d1 execute pc-db --remote --file=./backend/migrations/add_track_type_to_speed_records.sql

-- Добавляем колонку track_type
ALTER TABLE speed_records ADD COLUMN track_type TEXT;

-- Создаём индекс для быстрого поиска по типу трассы
CREATE INDEX IF NOT EXISTS idx_speed_records_track_type ON speed_records(track_type);
