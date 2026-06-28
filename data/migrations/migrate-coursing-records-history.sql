-- Добавление поля history для хранения исторических результатов в coursing_records
ALTER TABLE coursing_records ADD COLUMN history TEXT;
