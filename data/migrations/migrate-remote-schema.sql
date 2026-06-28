-- Миграция remote D1 до актуальной schema.sql
-- Безопасно запускать повторно: если колонка уже есть, wrangler выдаст ошибку — пропустите её.

ALTER TABLE events ADD COLUMN competition_kind TEXT;
ALTER TABLE events ADD COLUMN competition_type TEXT;
ALTER TABLE events ADD COLUMN last_modified TEXT;
ALTER TABLE results ADD COLUMN judge_count INTEGER DEFAULT 3;
