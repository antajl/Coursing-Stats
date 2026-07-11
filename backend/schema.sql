-- Coursing Stats — схема D1 (SQLite)

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  year          INTEGER NOT NULL,
  date_start    TEXT NOT NULL,        -- ISO 'YYYY-MM-DD'
  date_end      TEXT,                 -- для многодневных событий, иначе NULL
  rank_label    TEXT,                 -- 'ЧРКФ', 'CACL', 'РКФ' и т.п. (как на сайте)
  event_type    TEXT NOT NULL,        -- 'coursing' | 'bzmp' | 'racing'
  competition_kind TEXT,             -- вид соревнования: ЧРКФ, ПЧРКФ, CACL и т.д. (до скобок)
  competition_type TEXT,             -- тип соревнования: Курсинг борзых, БЗМП и т.д. (в скобках)
  title         TEXT,                 -- название состязания
  host_club     TEXT,                 -- принимающая организация
  region        TEXT,
  location      TEXT,
  catalog_url   TEXT,
  results_url   TEXT UNIQUE,          -- естественный ключ для дедупликации при повторных прогонах
  confirmed     INTEGER DEFAULT 0,    -- флаг "+" на сайте
  last_modified TEXT,                 -- Last-Modified заголовок для инкрементальных обновлений
  scraped_at    TEXT DEFAULT (datetime('now')),
  telegram_url  TEXT,
  full_title    TEXT,
  event_date    TEXT,                  -- дата события из заголовка результатов (DD.MM.YYYY)
  protocol_location TEXT,             -- локация из заголовка протокола (Регион, Район/Город)
  judges        TEXT,                  -- информация о судьях (JSON или строка)
  track_schemes TEXT,                 -- схемы трасс (JSON массив с URL и названиями)
  UNIQUE(date_start, title, location, event_type)  -- для дедупликации событий без results_url
);

CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

CREATE TABLE IF NOT EXISTS dogs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name_lat        TEXT NOT NULL,      -- канонiческое имя латиницей, как в каталоге
  name_ru         TEXT,
  breed           TEXT,
  sex             TEXT,               -- 'M' | 'F'
  pedigree_no     TEXT,               -- если удалось вытащить из PDF-каталога (фаза 2)
  microchip       TEXT,
  owner           TEXT,
  pedigree_url    TEXT,               -- ссылка на карточку собаки во внешнем архиве родословных
                                       -- (какой сайт — пока открытый вопрос, см. README)
  merged_into_dog_id INTEGER REFERENCES dogs(id), -- для ручной склейки дублей-опечаток
  created_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(name_lat, breed)
);

CREATE INDEX IF NOT EXISTS idx_dogs_breed ON dogs(breed);

CREATE TABLE IF NOT EXISTS judges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_judges_name ON judges(name);

CREATE TABLE IF NOT EXISTS results (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id        INTEGER NOT NULL REFERENCES events(id),
  dog_id          INTEGER NOT NULL REFERENCES dogs(id),
  breed_class     TEXT,               -- исходный заголовок группы, напр. "Афганская - Стандартная - Сука"
  catalog_no      INTEGER,
  placement       INTEGER,            -- место в группе, NULL если не присвоено/не финишировал
  total_score     REAL,               -- нормализованный итоговый балл для сравнения между событиями
  judge_count     INTEGER DEFAULT 3,  -- количество судей на соревновании (для нормализации очков)
  qualification   TEXT,               -- 'CACL, RegCACL' и т.п., как присуждено
  vc              TEXT,               -- статус '+' или пусто
  status          TEXT DEFAULT 'finished', -- 'finished' | 'disqualified' | 'withdrawn' | 'dns'
  raw_scores_json TEXT,               -- судейские баллы по кругам / время — формат зависит от event_type
  raw_text        TEXT,               -- исходная строка как есть, для отладки парсера и ручной проверки
  judges          TEXT,               -- информация о судьях из строки результата
  status_reason   TEXT,               -- причина статуса (disqualification, dns и т.д.)
  UNIQUE(event_id, dog_id, breed_class)
);

CREATE INDEX IF NOT EXISTS idx_results_dog ON results(dog_id);
CREATE INDEX IF NOT EXISTS idx_results_event ON results(event_id);

-- ===========================================================================
-- ТОПЫ
-- ===========================================================================
-- Это базовая (без фильтров) логика обоих рейтингов — view удобен для
-- проверки на глазок прямо в D1, но в реальном API (Worker) фильтры по
-- году/породе/типу события добавляются динамически через WHERE+JOIN events,
-- а не через сами view (view параметров не принимают). См. README, раздел
-- "API эндпоинты".

-- Топ по местам — "медальный зачёт": сортировка по золоту, потом серебру,
-- потом бронзе. Решает проблему "одна победа должна быть выше пяти
-- участий без побед" сама по себе, без искусственных весов.
CREATE VIEW IF NOT EXISTS v_top_by_placement AS
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  e.year,
  SUM(CASE WHEN r.placement = 1 THEN 1 ELSE 0 END) AS gold,
  SUM(CASE WHEN r.placement = 2 THEN 1 ELSE 0 END) AS silver,
  SUM(CASE WHEN r.placement = 3 THEN 1 ELSE 0 END) AS bronze,
  COUNT(*) AS total_starts
FROM results r
JOIN dogs d ON d.id = r.dog_id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
GROUP BY d.id, e.year
ORDER BY e.year DESC, gold DESC, silver DESC, bronze DESC;

-- Топ по очкам — не одна цифра, а контекст сразу: лучший результат,
-- средний балл и число стартов вместе, чтобы зритель сам видел разницу
-- между "1 старт с высоким баллом" и "стабильно высокие баллы на 10 стартах".
CREATE VIEW IF NOT EXISTS v_top_by_score AS
SELECT
  d.id AS dog_id,
  d.name_lat,
  d.name_ru,
  d.breed,
  e.year,
  MAX(r.total_score) AS best_score,
  COUNT(*) AS total_starts,
  MAX(
    (SELECT MAX(CAST(json_extract(j.value, '$.sum') AS REAL))
     FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h,
          json_each(json_extract(h.value, '$.judges')) AS j
     WHERE json_extract(j.value, '$.sum') IS NOT NULL)
  ) AS best_judge_score,
  ROUND(
    (SELECT AVG(CAST(json_extract(j.value, '$.sum') AS REAL))
     FROM json_each(json_extract(r.raw_scores_json, '$.heats')) AS h,
          json_each(json_extract(h.value, '$.judges')) AS j
     WHERE json_extract(j.value, '$.sum') IS NOT NULL)
  , 2) AS avg_judge_score
FROM results r
JOIN dogs d ON d.id = r.dog_id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'finished' AND r.total_score IS NOT NULL AND e.event_type IN ('coursing', 'bzmp')
GROUP BY d.id, e.year
ORDER BY e.year DESC, avg_judge_score DESC, total_starts DESC, best_judge_score DESC, best_score DESC;

-- ===========================================================================
-- РЕКОРДЫ СКОРОСТИ
-- ===========================================================================
-- Таблица для хранения рекордов скорости из Google Sheets
CREATE TABLE IF NOT EXISTS speed_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER REFERENCES dogs(id),
  breed TEXT NOT NULL,
  sex TEXT NOT NULL,
  name TEXT NOT NULL,
  speed_km_h REAL NOT NULL,
  date TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT DEFAULT 'normal',
  history TEXT,  -- JSON массив исторических результатов
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_speed_records_breed ON speed_records(breed);
CREATE INDEX IF NOT EXISTS idx_speed_records_speed ON speed_records(speed_km_h DESC);
CREATE INDEX IF NOT EXISTS idx_speed_records_dog_id ON speed_records(dog_id);

-- ===========================================================================
-- РЕКОРДЫ КУРСИНГА (БЕГИ БОРЗЫХ)
-- ===========================================================================
-- Таблица для хранения рекордов курсинга из Google Sheets
CREATE TABLE IF NOT EXISTS coursing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dog_id INTEGER REFERENCES dogs(id),
  breed TEXT NOT NULL,
  name TEXT NOT NULL,
  time_seconds REAL NOT NULL,
  date TEXT NOT NULL,
  track_length INTEGER DEFAULT 350,
  history TEXT,  -- JSON массив исторических результатов
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coursing_records_breed ON coursing_records(breed);
CREATE INDEX IF NOT EXISTS idx_coursing_records_time ON coursing_records(time_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_coursing_records_dog_id ON coursing_records(dog_id);
