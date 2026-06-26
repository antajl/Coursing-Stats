-- Миграция: добавление колонки track_schemes в таблицу events
ALTER TABLE events ADD COLUMN track_schemes TEXT;
