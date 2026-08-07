-- Миграция: добавление dog_id в таблицу speed_records
-- Выполни: npx wrangler d1 execute pc-db --remote --file=./backend/migrations/add_dog_id_to_speed_records.sql

-- Добавляем колонку dog_id
ALTER TABLE speed_records ADD COLUMN dog_id INTEGER REFERENCES dogs(id);

-- Создаём индекс
CREATE INDEX IF NOT EXISTS idx_speed_records_dog_id ON speed_records(dog_id);
