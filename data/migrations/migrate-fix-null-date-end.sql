-- Миграция: исправление строк "null" в date_end на реальные NULL значения
UPDATE events SET date_end = NULL WHERE date_end = 'null';
