-- Миграция: упрощение статусов до 3 значений
-- finished, disqualified, dns
-- withdrawn и dnf объединяются в disqualified

UPDATE results
SET status = 'disqualified'
WHERE status IN ('withdrawn', 'dnf');
