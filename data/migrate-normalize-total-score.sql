-- Миграция: нормализация total_score по количеству судей
-- Проблема: 2025-2026 использовали сырую сумму, 2023-2024 делили на захардкоженные 2 судьи
-- Решение: все данные нормализуются по реальному количеству судей (grand_total / judge_count)

-- Обновляем результаты формата simplified_2024 (2023-2024)
-- Они уже делились на judgeCount=2, но теперь нужно использовать реальный judge_count из raw_scores_json
UPDATE results 
SET total_score = CASE 
  WHEN json_extract(raw_scores_json, '$.judge_count') IS NOT NULL 
    AND json_extract(raw_scores_json, '$.judge_count') > 0
  THEN ROUND(json_extract(raw_scores_json, '$.raw_total') / json_extract(raw_scores_json, '$.judge_count'), 2)
  ELSE total_score
END
WHERE json_extract(raw_scores_json, '$.format') = 'simplified_2024';

-- Обновляем результаты формата 2025-2026 (без деления)
-- Делим grand_total на judge_count из events.judges
UPDATE results r
SET total_score = ROUND(
  json_extract(r.raw_scores_json, '$.grand_total') / 
  (SELECT LENGTH(e.judges) - LENGTH(REPLACE(e.judges, ',', '')) + 1 FROM events e WHERE e.id = r.event_id), 
  2
)
WHERE json_extract(r.raw_scores_json, '$.format') IS NULL 
  OR json_extract(r.raw_scores_json, '$.format') != 'simplified_2024';
