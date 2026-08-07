-- Добавляем dog_id в таблицу coursing_records
ALTER TABLE coursing_records ADD COLUMN dog_id INTEGER REFERENCES dogs(id);
CREATE INDEX IF NOT EXISTS idx_coursing_records_dog_id ON coursing_records(dog_id);
